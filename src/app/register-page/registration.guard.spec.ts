import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { of as observableOf } from 'rxjs';

import { AuthService } from '@dspace/core';
import { EpersonRegistrationService } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { Registration } from '@dspace/core';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject,
} from '@dspace/core';
import { registrationGuard } from './registration.guard';

describe('registrationGuard', () => {
  let guard: any;

  let epersonRegistrationService: EpersonRegistrationService;
  let router: Router;
  let authService: AuthService;

  let registration: Registration;
  let registrationRD: RemoteData<Registration>;
  let currentUrl: string;

  let startingRouteData: any;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    registration = Object.assign(new Registration(), {
      email: 'test@email.com',
      token: 'testToken',
      user: 'testUser',
    });
    registrationRD = createSuccessfulRemoteDataObject(registration);
    currentUrl = 'test-current-url';

    startingRouteData = {
      existingData: 'some-existing-data',
    };
    route = Object.assign(new ActivatedRouteSnapshot(), {
      data: Object.assign({}, startingRouteData),
      params: {
        token: 'testToken',
      },
    });
    state = Object.assign({
      url: currentUrl,
    });

    epersonRegistrationService = jasmine.createSpyObj('epersonRegistrationService', {
      searchByToken: observableOf(registrationRD),
    });
    router = jasmine.createSpyObj('router', {
      navigateByUrl: Promise.resolve(),
    }, {
      url: currentUrl,
    });
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: observableOf(false),
      setRedirectUrl: {},
    });

    guard = registrationGuard;
  });

  describe('canActivate', () => {
    describe('when searchByToken returns a successful response', () => {
      beforeEach(() => {
        (epersonRegistrationService.searchByToken as jasmine.Spy).and.returnValue(observableOf(registrationRD));
      });

      it('should return true', (done) => {
        guard(route, state, authService, epersonRegistrationService, router).subscribe((result) => {
          expect(result).toEqual(true);
          done();
        });
      });

      it('should add the response to the route\'s data', (done) => {
        guard(route, state, authService, epersonRegistrationService, router).subscribe(() => {
          expect(route.data).toEqual({ ...startingRouteData, registration: registrationRD });
          done();
        });
      });

      it('should not redirect', (done) => {
        guard(route, state, authService, epersonRegistrationService, router).subscribe(() => {
          expect(router.navigateByUrl).not.toHaveBeenCalled();
          done();
        });
      });
    });

    describe('when searchByToken returns a 404 response', () => {
      beforeEach(() => {
        (epersonRegistrationService.searchByToken as jasmine.Spy).and.returnValue(createFailedRemoteDataObject$('Not Found', 404));
      });

      it('should redirect', () => {
        guard(route, state, authService, epersonRegistrationService, router).subscribe();
        expect(router.navigateByUrl).toHaveBeenCalled();
      });
    });
  });
});
