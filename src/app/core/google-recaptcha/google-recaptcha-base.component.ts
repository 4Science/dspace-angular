import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  startWith,
  switchMap,
} from 'rxjs/operators';

import { CookieService } from '../services/cookie.service';
import { isNotEmpty } from './../../shared/empty.util';
import { NotificationsService } from './../../shared/notifications/notifications.service';
import {
  CAPTCHA_NAME,
  GoogleRecaptchaService,
} from './google-recaptcha.service';

@Component({
  template: '',
})
export abstract class GoogleRecaptchaBaseComponent {

  /**
   * The message prefix - default value is 'submit-form'.
   * Add translations if a different value is used.
   */
  MESSAGE_PREFIX = 'submit-form';

  constructor(
    public googleRecaptchaService: GoogleRecaptchaService,
    public cookieService: CookieService,
    public notificationsService: NotificationsService,
    public translate: TranslateService,
  ) {}

  /**
   * Return true if the user completed the reCaptcha verification (checkbox mode)
   */
  checkboxCheckedSubject$ = new BehaviorSubject<boolean>(false);

  /**
   * Disable the form until the user has completed the reCaptcha verification (checkbox mode)
   */
  disableUntilChecked = true;

  captchaVersion(): Observable<string> {
    return this.googleRecaptchaService.captchaVersion();
  }

  captchaMode(): Observable<string> {
    return this.googleRecaptchaService.captchaMode();
  }

  /**
   * Return true if the user has not completed the reCaptcha verification (checkbox mode)
   */
  disableUntilCheckedFcn(): Observable<boolean> {
    const checked$ = this.checkboxCheckedSubject$.asObservable();
    return combineLatest([
      this.captchaVersion(),
      this.captchaMode(),
      checked$,
    ]).pipe(
      // disable if checkbox is not checked or if reCaptcha is not in v2 checkbox mode
      switchMap(([captchaVersion, captchaMode, checked]) =>
        captchaVersion === 'v2' && captchaMode === 'checkbox'
          ? of(!checked)
          : of(false),
      ),
      startWith(true),
    );
  }

  /**
   * Return true if the user has accepted the required cookies for reCaptcha
   */
  isRecaptchaCookieAccepted(): boolean {
    const orejimeAnonymousCookie = this.cookieService.get('orejime-anonymous');
    return isNotEmpty(orejimeAnonymousCookie)
      ? orejimeAnonymousCookie[CAPTCHA_NAME]
      : false;
  }

  /**
   * Set the checkbox checked status to the given value
   */
  onCheckboxChecked(checked: boolean) {
    this.checkboxCheckedSubject$.next(checked);
  }

  /**
   * Show a notification to the user
   * @param key expected values: 'expired' or 'error'
   */
  showNotification(key) {
    const notificationTitle = this.translate.get(this.MESSAGE_PREFIX + '.google-recaptcha.notification.title');
    const notificationErrorMsg = this.translate.get(this.MESSAGE_PREFIX + '.google-recaptcha.notification.message.error');
    const notificationExpiredMsg = this.translate.get(this.MESSAGE_PREFIX + '.google-recaptcha.notification.message.expired');
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

  /**
   * execute the captcha function
   */
  executeRecaptcha() {
    this.googleRecaptchaService.executeRecaptcha();
  }
}
