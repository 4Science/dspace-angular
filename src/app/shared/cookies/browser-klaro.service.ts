import {
  Inject,
  Injectable,
  InjectionToken,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  deepClone,
  Operation,
} from 'fast-json-patch';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Observable,
  of as observableOf,
} from 'rxjs';
import {
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { EPersonDataService } from '../../core/eperson/eperson-data.service';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { CAPTCHA_NAME } from '../../core/google-recaptcha/google-recaptcha.service';
import { CookieService } from '../../core/services/cookie.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../../core/services/window.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import {
  hasValue,
  isEmpty,
  isNotEmpty,
} from '../empty.util';
import {
  CookieConsents,
  KlaroService,
} from './klaro.service';
import {
  ANONYMOUS_STORAGE_NAME_KLARO,
  klaroConfiguration,
} from './klaro-configuration';

/**
 * Metadata field to store a user's cookie consent preferences in
 */
export const COOKIE_MDFIELD = 'dspace.agreements.cookies';

/**
 * Prefix key for app title messages
 */
const cookieNameMessagePrefix = 'cookies.consent.app.title.';

/**
 * Prefix key for app description messages
 */
const cookieDescriptionMessagePrefix = 'cookies.consent.app.description.';

/**
 * Prefix key for app purpose messages
 */
const cookiePurposeMessagePrefix = 'cookies.consent.purpose.';

/**
 * Update request debounce in ms
 */
const updateDebounce = 300;

/**
 * By using this injection token instead of importing directly we can keep Klaro out of the main bundle
 */
const LAZY_KLARO = new InjectionToken<Promise<any>>(
  'Lazily loaded Klaro',
  {
    providedIn: 'root',
    factory: async () => (await import('klaro/dist/klaro-no-translations')),
  },
);

/**
 * Browser implementation for the KlaroService, representing a service for handling Klaro consent preferences and UI
 */
@Injectable({ providedIn: 'root' })
export class BrowserKlaroService extends KlaroService {

  private readonly GOOGLE_ANALYTICS_KEY = 'google.analytics.key';

  private readonly REGISTRATION_VERIFICATION_ENABLED_KEY = 'registration.verification.enabled';

  private readonly GOOGLE_ANALYTICS_SERVICE_NAME = 'google-analytics';
  /**
   * Initial Klaro configuration
   */
  klaroConfig = cloneDeep(klaroConfiguration);

  /**
   * Subject to emit updates in the consents
   */
  consentsUpdates$:  BehaviorSubject<CookieConsents> = new BehaviorSubject<CookieConsents>(null);
  /**
   * Subject to emit initialization
   */
  initialized$:  BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Boolean to check if a new watch method from the manager needs to be fired
   * @private
   */
  private isKlaroManagerWatching = false;
  /**
   * Boolean to check if service has been initialized
   * @private
   */
  private initialized = false;
  constructor(
    private translateService: TranslateService,
    private authService: AuthService,
    private ePersonService: EPersonDataService,
    private configService: ConfigurationDataService,
    private cookieService: CookieService,
    @Inject(LAZY_KLARO) private lazyKlaro: Promise<any>,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
  ) {
    super();
  }

  /**
   * Initializes the service:
   *  - Retrieves the current authenticated user
   *  - Checks if the translation service is ready
   *  - Initialize configuration for users
   *  - Add and translate klaro configuration messages
   */
  initialize() {
    if (!environment.info.enablePrivacyStatement) {
      delete this.klaroConfig.privacyPolicy;
      this.klaroConfig.translations.zy.consentNotice.description = 'cookies.consent.content-notice.description.no-privacy';
    }

    if (hasValue(environment.info.metricsConsents)) {
      environment.info.metricsConsents.forEach((metric) => {
        if (metric.enabled) {
          this.klaroConfig.services.push(
            {
              name: metric.key,
              purposes: ['thirdPartyJs'],
              required: false,
            },
          );
        }
      });
    }

    if (environment.datadogRum?.clientToken && environment.datadogRum?.applicationId &&
      environment.datadogRum?.service && environment.datadogRum?.env) {
      this.klaroConfig.services.push(
        {
          name: 'datadog',
          purposes: ['thirdPartyJs'],
          required: false,
        },
      );
    }

    const hideGoogleAnalytics$ = this.configService.findByPropertyName(this.GOOGLE_ANALYTICS_KEY).pipe(
      getFirstCompletedRemoteData(),
      map(remoteData => !remoteData.hasSucceeded || !remoteData.payload || isEmpty(remoteData.payload.values)),
    );

    const hideRegistrationVerification$ = this.configService.findByPropertyName(this.REGISTRATION_VERIFICATION_ENABLED_KEY).pipe(
      getFirstCompletedRemoteData(),
      map((remoteData) =>
        !remoteData.hasSucceeded || !remoteData.payload || isEmpty(remoteData.payload.values) || remoteData.payload.values[0].toLowerCase() !== 'true',
      ),
    );

    const servicesToHide$: Observable<string[]> = observableCombineLatest([hideGoogleAnalytics$, hideRegistrationVerification$]).pipe(
      map(([hideGoogleAnalytics, hideRegistrationVerification]) => {
        const servicesToHideArray: string[] = [];
        if (hideGoogleAnalytics) {
          servicesToHideArray.push(this.GOOGLE_ANALYTICS_SERVICE_NAME);
        }
        if (hideRegistrationVerification) {
          servicesToHideArray.push(CAPTCHA_NAME);
        }
        return servicesToHideArray;
      }),
    );

    this.translateService.setDefaultLang(environment.defaultLanguage);

    const user$: Observable<EPerson> = this.getUser$();

    const translationServiceReady$ = this.translateService.get('loading.default').pipe(take(1));

    observableCombineLatest([user$, servicesToHide$, translationServiceReady$])
      .subscribe(([user, servicesToHide, _]: [EPerson, string[], string]) => {
        user = cloneDeep(user);

        if (hasValue(user)) {
          this.initializeUser(user);
        }

        /**
         * Add all message keys for services and purposes
         */
        this.addAppMessages();

        /**
         * Subscribe on a message to make sure the translation service is ready
         * Translate all keys in the translation section of the configuration
         * Show the configuration if the configuration has not been confirmed
         */
        this.translateConfiguration();

        if (!environment.info?.enableCookieConsentPopup || this._window?.nativeWindow?.Cypress) {
          this.klaroConfig.services = [];
        } else {
          this.klaroConfig.services = this.filterConfigServices(servicesToHide);
        }
        this.lazyKlaro.then(({ setup }) => {
          setup(this.klaroConfig);
          this.initialized = true;
          this.initialized$.next(this.initialized);
        });
      });

    this.consentsUpdates$.pipe(
      filter(() => this.initialized),
    ).subscribe((consents) => this.isKlaroManagerWatching = hasValue(consents));
  }

  /**
   * Return saved preferences stored in the klaro cookie
   */
  getSavedPreferences(): Observable<any> {
    return this.getUser$().pipe(
      map((user: EPerson) => {
        let storageName;
        if (isEmpty(user)) {
          storageName = ANONYMOUS_STORAGE_NAME_KLARO;
        } else {
          storageName = this.getStorageName(user.uuid);
        }
        return this.cookieService.get(storageName);
      }),
    );
  }

  /**
   * Initialize configuration for the logged in user
   * @param user The authenticated user
   */
  private initializeUser(user: EPerson) {
    this.klaroConfig.callback = debounce((consent, app) => this.updateSettingsForUsers(user), updateDebounce);
    this.klaroConfig.storageName = this.getStorageName(user.uuid);

    const anonCookie = this.cookieService.get(ANONYMOUS_STORAGE_NAME_KLARO);
    if (hasValue(this.getSettingsForUser(user))) {
      this.restoreSettingsForUsers(user);
    } else if (hasValue(anonCookie)) {
      this.cookieService.set(this.getStorageName(user.uuid), anonCookie);
      this.updateSettingsForUsers(user);
    }
  }

  /**
   * Retrieves the currently logged in user
   * Returns undefined when no one is logged in
   */
  private getUser$() {
    return this.authService.isAuthenticated()
      .pipe(
        take(1),
        switchMap((loggedIn: boolean) => {
          if (loggedIn) {
            return this.authService.getAuthenticatedUserFromStore();
          }
          return observableOf(undefined);
        }),
        take(1),
      );
  }

  /**
   * Create a title translation key
   * @param title
   */
  private getTitleTranslation(title: string) {
    return cookieNameMessagePrefix + title;
  }

  /**
   * Create a description translation key
   * @param description
   */
  private getDescriptionTranslation(description: string) {
    return cookieDescriptionMessagePrefix + description;
  }

  /**
   * Create a purpose translation key
   * @param purpose
   */
  private getPurposeTranslation(purpose: string) {
    return cookiePurposeMessagePrefix + purpose;
  }

  /**
   * Show the cookie consent form
   */
  showSettings() {
    void this.lazyKlaro.then(({ show }) => show(this.klaroConfig, true));
  }

  /**
   * Add message keys for all services and purposes
   */
  addAppMessages() {
    this.klaroConfig.services.forEach((app) => {
      this.klaroConfig.translations.zy[app.name] = {
        title: this.getTitleTranslation(app.name),
        description: this.getDescriptionTranslation(app.name),
      };
      app.purposes.forEach((purpose) => {
        this.klaroConfig.translations.zy.purposes[purpose] = this.getPurposeTranslation(purpose);
      });
    });
  }

  /**
   * Translate the translation section from the Klaro configuration
   */
  translateConfiguration() {
    /**
     * Make sure the fallback language is english
     */
    this.translateService.setDefaultLang(environment.defaultLanguage);

    this.translate(this.klaroConfig.translations.zy);
  }

  /**
   * Translate string values in an object
   * @param object The object containing translation keys
   */
  private translate(object) {
    if (typeof (object) === 'string') {
      return this.translateService.instant(object);
    }
    Object.entries(object).forEach(([key, value]: [string, any]) => {
      object[key] = this.translate(value);
    });
    return object;
  }

  /**
   * Retrieves the stored Klaro consent settings for a user
   * @param user The user to resolve the consent for
   */
  getSettingsForUser(user: EPerson) {
    const mdValue = user.firstMetadataValue(COOKIE_MDFIELD);
    return hasValue(mdValue) ? JSON.parse(mdValue) : undefined;
  }

  /**
   * Stores the Klaro consent settings for a user in a metadata field
   * @param user The user to save the settings for
   * @param config The consent settings for the user to save
   */
  setSettingsForUser(user: EPerson, config: object) {
    if (isNotEmpty(config)) {
      user.setMetadata(COOKIE_MDFIELD, undefined, JSON.stringify(config));
    } else {
      user.removeMetadata(COOKIE_MDFIELD);
    }
    this.ePersonService.createPatchFromCache(user)
      .pipe(
        take(1),
        switchMap((operations: Operation[]) => {
          if (isNotEmpty(operations)) {
            return this.ePersonService.patch(user, operations);
          }
          return observableOf(undefined);
        },
        ),
      ).subscribe();
  }

  /**
   * Restores the users consent settings cookie based on the user's stored consent settings
   * @param user The user to save the settings for
   */
  restoreSettingsForUsers(user: EPerson) {
    this.cookieService.set(this.getStorageName(user.uuid), this.getSettingsForUser(user));
  }

  /**
   * Stores the consent settings for a user based on the current cookie for this user
   * @param user
   */
  updateSettingsForUsers(user: EPerson) {
    this.setSettingsForUser(user, this.cookieService.get(this.getStorageName(user.uuid)));
  }

  /**
   * Create the storage name for klaro cookies based on the user's identifier
   * @param identifier The user's uuid
   */
  getStorageName(identifier: string) {
    return 'klaro-' + identifier;
  }

  watchConsentUpdates(): void {
    if (this.isKlaroManagerWatching || !this.initialized) {
      return;
    }

    this.lazyKlaro.then(({ getManager }) => {
      const manager = getManager(this.klaroConfig);
      const consentsSubject$ = this.consentsUpdates$;
      let lastCookiesConsents;

      consentsSubject$.next(manager.consents);
      manager.watch({
        update(_, eventName, consents) {
          if (eventName === 'consents' && !isEqual(consents, lastCookiesConsents)) {
            lastCookiesConsents = deepClone(consents);
            consentsSubject$.next(consents);
          }
        },
      });
    });
  }

  /**
   * remove the google analytics from the services
   */
  private filterConfigServices(servicesToHide: string[]): Pick<typeof klaroConfiguration, 'services'>[] {
    return this.klaroConfig.services.filter(service => !servicesToHide.some(name => name === service.name));
  }

}
