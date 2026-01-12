import { TestBed } from '@angular/core/testing';
import {
  MockStore,
  provideMockStore,
} from '@ngrx/store/testing';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CookieConsents,
  OrejimeService,
} from '../cookies/orejime.service';
import { BrowserDatadogRumService } from './browser-datadog-rum.service';
import { DatadogRumService } from './datadog-rum.service';

describe('DatadogRumService', () => {
  let service: BrowserDatadogRumService;
  let store: MockStore;
  let orejimeService: OrejimeService;
  let memoizedSelector;

  const initialState = {
    datadogRum: {
      isInitialized: false,
      isRunning: false,
    },
  };

  const consentsAccepted: CookieConsents = {
    datadog: true,
  };

  const orejimeServiceSpy = jasmine.createSpyObj('OrejimeService', {
    getSavedPreferences: jasmine.createSpy('getSavedPreferences'),
    watchConsentUpdates: jasmine.createSpy('watchConsentUpdates').and.returnValue(null),
  }, {
    consentsUpdates$: of(consentsAccepted),
    initialized$: of(true),
  });

  const datadogRumEnvironmentOptions = {
    clientToken: 'clientToken',
    applicationId: 'applicationId',
    service: 'service',
    env: 'env',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DatadogRumService, useClass: BrowserDatadogRumService },
        provideMockStore({ initialState }),
        {
          provide: OrejimeService, useValue: orejimeServiceSpy,
        },
      ],
    });
    service = TestBed.inject(DatadogRumService) as BrowserDatadogRumService;
    store = TestBed.inject(MockStore);
    memoizedSelector = store.overrideSelector(service.datadogRumStateSelector, initialState.datadogRum);
    orejimeService = TestBed.inject(OrejimeService);

    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch setDatadogRumStatusAction with isInitialized and isRunning true when datadog cookie is accepted', () => {
    memoizedSelector.setResult({ isInitialized: false, isRunning: false });
    store.refreshState();
    consentsAccepted.datadog = true;
    environment.datadogRum = datadogRumEnvironmentOptions;
    service.initDatadogRum();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      payload: {
        isInitialized: true,
        isRunning: true,
      },
    }));
  });

  it('should dispatch setDatadogRumStatusAction with isRunning true when datadog cookie is accepted and isInitialized is true', () => {
    memoizedSelector.setResult({ isInitialized: true, isRunning: false });
    store.refreshState();
    consentsAccepted.datadog = true;
    environment.datadogRum = datadogRumEnvironmentOptions;
    service.initDatadogRum();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      payload: {
        isRunning: true,
      },
    }));
  });

  it('should dispatch setDatadogRumStatusAction with isRunning false when datadog cookie is not accepted', () => {
    memoizedSelector.setResult({ isInitialized: true, isRunning: true });
    store.refreshState();
    consentsAccepted.datadog = false;
    service.initDatadogRum();
    expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({
      payload: {
        isRunning: false,
      },
    }));
  });

});
