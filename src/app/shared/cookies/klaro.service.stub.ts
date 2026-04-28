import { of } from 'rxjs';

export class KlaroServiceStub {
  initialize = jasmine.createSpy('initialize').and.returnValue(of({}));

  showSettings = jasmine.createSpy('showSettings').and.returnValue(of({}));

  getSavedPreferences = jasmine.createSpy('getSavedPreferences').and.returnValue(of({}));

  watchConsentUpdates = jasmine.createSpy('watchConsentUpdates').and.returnValue(of({}));

  consentsUpdates$ = of({});
}
