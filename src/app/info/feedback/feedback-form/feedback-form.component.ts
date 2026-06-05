import { NgIf } from '@angular/common';
import { AsyncPipe } from '@angular/common';
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
  combineLatest,
  of,
  Subscription,
} from 'rxjs';
import {
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import { ConfigurationProperty } from 'src/app/core/shared/configuration-property.model';

import { getHomePageRoute } from '../../../app-routing-paths';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { RemoteData } from '../../../core/data/remote-data';
import { EPerson } from '../../../core/eperson/models/eperson.model';
import { FeedbackDataService } from '../../../core/feedback/feedback-data.service';
import { GoogleRecaptchaService } from '../../../core/google-recaptcha/google-recaptcha.service';
import { GoogleRecaptchaBaseComponent } from '../../../core/google-recaptcha/google-recaptcha-base.component';
import { CookieService } from '../../../core/services/cookie.service';
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
import { AlertComponent } from '../../../shared/alert/alert.component';
import { AlertType } from '../../../shared/alert/alert-type';
import { BtnDisabledDirective } from '../../../shared/btn-disabled.directive';
import { OrejimeService } from '../../../shared/cookies/orejime.service';
import { ErrorComponent } from '../../../shared/error/error.component';
import { GoogleRecaptchaComponent } from '../../../shared/google-recaptcha/google-recaptcha.component';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { CookieService } from '../../../core/services/cookie.service';
import { isNotEmpty } from '../../../shared/empty.util';
import { KlaroService } from 'src/app/shared/cookies/klaro.service';
import { ConfigurationProperty } from 'src/app/core/shared/configuration-property.model';

@Component({
  selector: 'ds-base-feedback-form',
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, ErrorComponent, TranslateModule, BtnDisabledDirective, AlertComponent, GoogleRecaptchaComponent, AsyncPipe],
})
/**
 * Component displaying the contents of the Feedback Statement
 */
export class FeedbackFormComponent extends GoogleRecaptchaBaseComponent implements OnInit, OnDestroy {

  /**
   * Form builder created used from the feedback from
   */
  feedbackForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    message: ['', Validators.required],
    page: [''],
  });

  /**
   * The message prefix for translation keys
   */
  MESSAGE_PREFIX = 'info.feedback';

  /**
   * Whether reCAPTCHA verification is enabled for feedback
   */
  submissionVerification = false;

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
    public notificationsService: NotificationsService,
    public translate: TranslateService,
    private feedbackDataService: FeedbackDataService,
    private authService: AuthService,
    private router: Router,
    public googleRecaptchaService: GoogleRecaptchaService,
    private configService: ConfigurationDataService,
    private cookieService: CookieService,
    @Optional() public klaroService: KlaroService,
  ) {
    super(googleRecaptchaService, cookieService, notificationsService, translate);

    this.subscriptions.push(
      this.configService.findByPropertyName('feedback.verification.enabled').pipe(
        getFirstSucceededRemoteDataPayload(),
        map((res: ConfigurationProperty) => res?.values[0].toLowerCase() === 'true'),
      ).subscribe((res: boolean) => {
        this.submissionVerification = res;
        if (res) {
          this.googleRecaptchaService.loadRecaptchaProperties().subscribe();
        }
      }));
  }

  /**
   * On init check if user is logged in and use its email if so
   */
  ngOnInit() {
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
      this.submissionVerification = enabled;
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
    const url = '/home';
    this.feedbackDataService.createWithCaptcha(this.feedbackForm.value, captchaToken).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((response: RemoteData<NoContent>) => {
      if (response.isSuccess) {
        this.notificationsService.success(this.translate.instant('info.feedback.create.success'));
        this.feedbackForm.reset();
        this.router.navigateByUrl(url);
      }
    });
  }

  submitFeedback(tokenV2?): void {
    if (!this.feedbackForm.invalid) {
      if (this.submissionVerification) {
        this.subscriptions.push(combineLatest([this.captchaVersion(), this.captchaMode()]).pipe(
          switchMap(([captchaVersion, captchaMode]) => {
            if (captchaVersion === 'v3') {
              return this.googleRecaptchaService.getRecaptchaToken('feedback_submission');
            } else if (captchaVersion === 'v2' && captchaMode === 'checkbox') {
              return of(this.googleRecaptchaService.getRecaptchaTokenResponse());
            } else if (captchaVersion === 'v2' && captchaMode === 'invisible') {
              return of(tokenV2);
            } else {
              console.error(`Invalid reCaptcha configuration: version = ${captchaVersion}, mode = ${captchaMode}`);
              this.showNotification('error');
            }
          }),
          take(1),
        ).subscribe((token) => {
          if (token) {
            this.createFeedback(token);
          } else {
            console.error('reCaptcha error');
            this.showNotification('error');
          }
        },
        ));
      } else {
        this.createFeedback();
      }
    }
  }

  /**
   * Open the cookie settings dialog
   */
  openCookieSettings(): void {
    if (this.klaroService) {
      this.klaroService.showSettings();
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
