import {
  inject,
  Injectable,
} from '@angular/core';
import {
  MatomoInitializerService,
  MatomoTracker,
} from 'ngx-matomo-client';

import { environment } from '../../environments/environment';
import { NativeWindowService } from '../core/services/window.service';
import { KlaroService } from '../shared/cookies/klaro.service';

@Injectable({
  providedIn: 'root',
})
export class MatomoService {

  matomoInitializer = inject(MatomoInitializerService);
  matomoTracker = inject(MatomoTracker);
  klaroService = inject(KlaroService);
  _window = inject(NativeWindowService);

  init() {
    if (this._window.nativeWindow) {
      this._window.nativeWindow.changeMatomoConsent = this.changeMatomoConsent;
    }

    if (environment.production) {
      const preferences$ = this.klaroService.getSavedPreferences();

      preferences$.subscribe(preferences => {
        this.changeMatomoConsent(preferences.matomo);

        if (environment.matomo?.siteId && environment.matomo?.trackerUrl) {
          this.matomoInitializer.initializeTracker({
            siteId: environment.matomo.siteId,
            trackerUrl: environment.matomo.trackerUrl,
          });
        }
      });
    }
  }

  changeMatomoConsent = (consent: boolean) => {
    if (consent) {
      this.matomoTracker.setConsentGiven();
    } else {
      this.matomoTracker.forgetConsentGiven();
    }
  };
}
