import { TestBed } from '@angular/core/testing';
import {
  MatomoInitializerService,
  MatomoTracker,
} from 'ngx-matomo-client';
import { MatomoTestingModule } from 'ngx-matomo-client/testing';
import { of } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../core/services/window.service';
import { OrejimeService } from '../shared/cookies/orejime.service';
import { MatomoService } from './matomo.service';

describe('MatomoService', () => {
  let service: MatomoService;
  let matomoTracker: jasmine.SpyObj<MatomoTracker>;
  let matomoInitializer: jasmine.SpyObj<MatomoInitializerService>;
  let orejimeService: jasmine.SpyObj<OrejimeService>;
  let nativeWindowService: jasmine.SpyObj<NativeWindowRef>;

  beforeEach(() => {
    matomoTracker = jasmine.createSpyObj('MatomoTracker', ['setConsentGiven', 'forgetConsentGiven']);
    matomoInitializer = jasmine.createSpyObj('MatomoInitializerService', ['initializeTracker']);
    orejimeService = jasmine.createSpyObj('OrejimeService', ['getSavedPreferences']);
    nativeWindowService = jasmine.createSpyObj('NativeWindowService', [], { nativeWindow: {} });

    TestBed.configureTestingModule({
      imports: [MatomoTestingModule.forRoot()],
      providers: [
        { provide: MatomoTracker, useValue: matomoTracker },
        { provide: MatomoInitializerService, useValue: matomoInitializer },
        { provide: OrejimeService, useValue: orejimeService },
        { provide: NativeWindowService, useValue: nativeWindowService },
      ],
    });

    service = TestBed.inject(MatomoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set changeMatomoConsent on native window', () => {
    orejimeService.getSavedPreferences.and.returnValue(of({ matomo: true }));
    service.init();
    expect(nativeWindowService.nativeWindow.changeMatomoConsent).toBe(service.changeMatomoConsent);
  });

  it('should initialize tracker with correct parameters in production', () => {
    environment.production = true;
    environment.matomo = { siteId: '1', trackerUrl: 'http://example.com' };
    orejimeService.getSavedPreferences.and.returnValue(of({ matomo: true }));

    service.init();

    expect(matomoTracker.setConsentGiven).toHaveBeenCalled();
    expect(matomoInitializer.initializeTracker).toHaveBeenCalledWith({
      siteId: '1',
      trackerUrl: 'http://example.com',
    });
  });

  it('should not initialize tracker if not in production', () => {
    environment.production = false;

    service.init();

    expect(matomoInitializer.initializeTracker).not.toHaveBeenCalled();
  });

  it('should call setConsentGiven when consent is true', () => {
    service.changeMatomoConsent(true);
    expect(matomoTracker.setConsentGiven).toHaveBeenCalled();
  });

  it('should call forgetConsentGiven when consent is false', () => {
    service.changeMatomoConsent(false);
    expect(matomoTracker.forgetConsentGiven).toHaveBeenCalled();
  });
});
