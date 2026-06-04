
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import {
  map,
  startWith,
  switchMap,
  take,
} from 'rxjs/operators';

import { getHomePageRoute } from '../../../app-routing-paths';
import { AuthService } from '../../../core/auth/auth.service';
import { RemoteData } from '../../../core/data/remote-data';
import { EPerson } from '../../../core/eperson/models/eperson.model';
import { FeedbackDataService } from '../../../core/feedback/feedback-data.service';
import {
  CAPTCHA_NAME,
  GoogleRecaptchaService,
} from '../../../core/google-recaptcha/google-recaptcha.service';
import { RouteService } from '../../../core/services/route.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../../../core/services/window.service';
import { NoContent } from '../../../core/shared/NoContent.model';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
} from '../../../core/shared/operators';
import { URLCombiner } from '../../../core/url-combiner/url-combiner';
import { BtnDisabledDirective } from '../../../shared/btn-disabled.directive';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { AlertType } from '../../../shared/alert/alert-type';
import { ErrorComponent } from '../../../shared/error/error.component';
import { GoogleRecaptchaComponent } from '../../../shared/google-recaptcha/google-recaptcha.component';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { OrejimeService } from '../../../shared/cookies/orejime.service';
import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { CookieService } from '../../../core/services/cookie.service';
import { isNotEmpty } from '../../../shared/empty.util';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'ds-base-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
  imports: [
    AlertComponent,
    BtnDisabledDirective,
    ErrorComponent,
    FormsModule,
    GoogleRecaptchaComponent,
    ReactiveFormsModule,
    TranslateModule,
    AsyncPipe,
  ],
})
/**
 * Component displaying the contents of the Feedback Statement
 */
export class FeedbackFormComponent implements OnInit, OnDestroy {

  /**
   * Form builder created used from the feedback from
   */
  feedbackForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    message: ['', Validators.required],
    page: [''],
  });

  /**
   * Return true if the user completed the reCaptcha verification (checkbox mode)
   */
  checkboxCheckedSubject$ = new BehaviorSubject<boolean>(false);

  disableUntilChecked = true;

  captchaVersion$: Observable<string>;

  captchaMode$: Observable<string>;

  /**
   * Whether reCAPTCHA verification is enabled for feedback
   */
  feedbackRecaptchaEnabled = false;

  /**
   * AlertType enumeration
   */
  public AlertTypeEnum = AlertType;

  subscriptions: Subscription[] = [];

  readonly FEEDBACK_VERIFICATION_PROP_KEY = 'feedback.verification.enabled';

  constructor(
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    public routeService: RouteService,
    private fb: UntypedFormBuilder,
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
    private feedbackDataService: FeedbackDataService,
    private authService: AuthService,
    private router: Router,
    public googleRecaptchaService: GoogleRecaptchaService,
    private configService: ConfigurationDataService,
    private cookieService: CookieService,
    @Optional() public orejimeService: OrejimeService,
  ) {
  }

  /**
   * On init check if user is logged in and use its email if so
   */
  ngOnInit() {
    this.captchaVersion$ = this.googleRecaptchaService.captchaVersion();
    this.captchaMode$ = this.googleRecaptchaService.captchaMode();

    this.authService.getAuthenticatedUserFromStore().pipe(take(1)).subscribe((user: EPerson) => {
      if (user) {
        this.feedbackForm.patchValue({ email: user.email });
      }
    });

    this.routeService.getPreviousUrl().pipe(take(1)).subscribe((url: string) => {
      if (!url) {
        url = getHomePageRoute();
      }
      const relatedUrl = new URLCombiner(this._window.nativeWindow.origin, url).toString();
      this.feedbackForm.patchValue({ page: relatedUrl });
    });

    this.subscriptions.push(this.configService.findByPropertyName(this.FEEDBACK_VERIFICATION_PROP_KEY).pipe(
      getFirstSucceededRemoteDataPayload(),
      map((res) => res?.values[0].toLowerCase() === 'true'),
      take(1),
    ).subscribe((enabled: boolean) => {
      this.feedbackRecaptchaEnabled = enabled;
      if (enabled) {
        this.refreshRecaptchaScript();
        this.subscriptions.push(this.disableUntilCheckedFcn().subscribe((res) => {
          this.disableUntilChecked = res;
        }));
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  /**
   * Try to load the reCAPTCHA script if not already loaded via registration config
   */
  private refreshRecaptchaScript(): void {
    if (this._window.nativeWindow.refreshCaptchaScript) {
      this._window.nativeWindow.refreshCaptchaScript();
    } else {
      this.googleRecaptchaService.loadRecaptchaProperties().subscribe();
    }
  }

  /**
   * Function to create the feedback from form values
   */
  createFeedback(captchaToken?: string): void {
    if (this.feedbackRecaptchaEnabled) {
      combineLatest([this.captchaVersion$, this.captchaMode$]).pipe(
        switchMap(([captchaVersion, captchaMode]) => {
          if (captchaVersion === 'v3') {
            return this.googleRecaptchaService.getRecaptchaToken('feedback');
          } else if (captchaVersion === 'v2' && captchaMode === 'checkbox') {
            return of(this.googleRecaptchaService.getRecaptchaTokenResponse());
          } else if (captchaVersion === 'v2' && captchaMode === 'invisible') {
            return of(captchaToken);
          } else {
            this.showNotification('error');
            return of(null);
          }
        }),
        take(1),
      ).subscribe((token) => {
        if (isNotEmpty(token)) {
          this.submitFeedback(token);
        } else {
          this.showNotification('error');
        }
      });
    } else {
      this.submitFeedback();
    }
  }

  /**
   * Send the feedback with the captcha token
   */
  private submitFeedback(captcha?: string): void {
    const url = this.feedbackForm.value.page.replace(this._window.nativeWindow.origin, '');
    const feedback = { ...this.feedbackForm.value };
    if (isNotEmpty(captcha)) {
      feedback.captcha = captcha;
    }
    this.feedbackDataService.create(feedback).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((response: RemoteData<NoContent>) => {
      if (response.isSuccess) {
        this.notificationsService.success(this.translate.instant('info.feedback.create.success'));
        this.feedbackForm.reset();
        this.router.navigateByUrl(url);
      }
    });
  }

  /**
   * Return true if the user has accepted the required cookies for reCaptcha
   */
  isRecaptchaCookieAccepted(): boolean {
    const orejimeAnonymousCookie = this.cookieService.get('orejime-anonymous');
    return isNotEmpty(orejimeAnonymousCookie) ? orejimeAnonymousCookie[CAPTCHA_NAME] : false;
  }

  /**
   * Return true if the user has not completed the reCaptcha verification (checkbox mode)
   */
  disableUntilCheckedFcn(): Observable<boolean> {
    const checked$ = this.checkboxCheckedSubject$.asObservable();
    return combineLatest([this.captchaVersion$, this.captchaMode$, checked$]).pipe(
      switchMap(([captchaVersion, captchaMode, checked]) =>
        captchaVersion === 'v2' && captchaMode === 'checkbox' ? of(!checked) : of(false),
      ),
      startWith(true),
    );
  }

  onCheckboxChecked(checked: boolean) {
    this.checkboxCheckedSubject$.next(checked);
  }

  /**
   * execute the captcha function for v2 invisible
   */
  executeRecaptcha() {
    this.googleRecaptchaService.executeRecaptcha();
  }

  /**
   * Open the cookie settings dialog
   */
  openCookieSettings(): void {
    if (this.orejimeService) {
      this.orejimeService.showSettings();
    }
  }

  /**
   * Show a notification to the user
   */
  showNotification(key: string) {
    const notificationTitle = this.translate.instant('info.feedback.google-recaptcha.notification.title');
    const notificationErrorMsg = this.translate.instant('info.feedback.google-recaptcha.notification.message.error');
    const notificationExpiredMsg = this.translate.instant('info.feedback.google-recaptcha.notification.message.expired');
    switch (key) {
      case 'expired':
        this.notificationsService.warning(notificationTitle, notificationExpiredMsg);
        break;
      case 'error':
        this.notificationsService.error(notificationTitle, notificationErrorMsg);
        break;
      default:
        console.warn(`Unimplemented notification '${key}' from reCaptcha service`);
    }
  }
}
