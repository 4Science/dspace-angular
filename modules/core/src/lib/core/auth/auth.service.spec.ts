import { CommonModule } from '@angular/common';
import {
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import {
  Store,
  StoreModule,
} from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { cold } from 'jasmine-marbles';
import {
  Observable,
  of as observableOf,
} from 'rxjs';

import { RemoteDataBuildService } from '../cache';
import { CoreState } from '../core-state.model';
import { RemoteData } from '../data';
import { EPersonDataService } from '../eperson';
import { EPerson } from '../eperson';
import { getMockTranslateService } from '../mocks';
import { NotificationsService } from '../notifications';
import { ClientCookieService } from '../services';
import { CookieService } from '../services';
import { HardRedirectService } from '../services';
import { RouteService } from '../services';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../services';
import { REQUEST } from '../tokens';
import { createSuccessfulRemoteDataObject$ } from '../utilities';
import { ActivatedRouteStub } from '../utilities';
import { AuthRequestServiceStub } from '../utilities';
import { authMethodsMock } from '../utilities';
import { EPersonMock } from '../utilities';
import { NotificationsServiceStub } from '../utilities';
import { routeServiceStub } from '../utilities';
import { RouterStub } from '../utilities';
import {
  SpecialGroupDataMock,
  SpecialGroupDataMock$,
} from '../utilities';
import {
  SetUserAsIdleAction,
  UnsetUserAsIdleAction,
} from './auth.actions';
import {
  authReducer,
  AuthState,
} from './auth.reducer';
import {
  AuthService,
  IMPERSONATING_COOKIE,
} from './auth.service';
import { AuthRequestService } from './auth-request.service';
import { AuthMethod } from './models';
import { AuthStatus } from './models';
import { AuthTokenInfo } from './models';

describe('AuthService test', () => {

  const mockEpersonDataService: any = {
    findByHref(href: string): Observable<RemoteData<EPerson>> {
      return createSuccessfulRemoteDataObject$(EPersonMock);
    },
  };

  let mockStore: Store<AuthState>;
  let authService: AuthService;
  let routeServiceMock: RouteService;
  let authRequest;
  let window;
  let routerStub;
  let routeStub;
  let storage: CookieService;
  let token: AuthTokenInfo;
  let authenticatedState;
  let unAuthenticatedState;
  let idleState;
  let linkService;
  let hardRedirectService;

  const AuthStatusWithSpecialGroups = Object.assign(new AuthStatus(), {
    uuid: 'test',
    authenticated: true,
    okay: true,
    specialGroups: SpecialGroupDataMock$,
  });

  function init() {
    mockStore = jasmine.createSpyObj('store', {
      dispatch: {},
      pipe: observableOf(true),
    });
    window = new NativeWindowRef();
    routerStub = new RouterStub();
    token = new AuthTokenInfo('test_token');
    token.expires = Date.now() + (1000 * 60 * 60);
    authenticatedState = {
      authenticated: true,
      loaded: true,
      loading: false,
      authToken: token,
      user: EPersonMock,
      idle: false,
    };
    unAuthenticatedState = {
      authenticated: false,
      loaded: true,
      loading: false,
      authToken: undefined,
      user: undefined,
      idle: false,
    };
    idleState = {
      authenticated: true,
      loaded: true,
      loading: false,
      authToken: token,
      user: EPersonMock,
      idle: true,
    };
    authRequest = new AuthRequestServiceStub();
    routeStub = new ActivatedRouteStub();
    linkService = {
      resolveLinks: {},
    };
    hardRedirectService = jasmine.createSpyObj('hardRedirectService', ['redirect']);
    spyOn(linkService, 'resolveLinks').and.returnValue({ authenticated: true, eperson: observableOf({ payload: {} }) });

  }

  describe('', () => {
    beforeEach(() => {
      init();
      TestBed.configureTestingModule({
        imports: [
          CommonModule,
          StoreModule.forRoot({ authReducer }, {
            runtimeChecks: {
              strictStateImmutability: false,
              strictActionImmutability: false,
            },
          }),
        ],
        providers: [
          { provide: AuthRequestService, useValue: authRequest },
          { provide: NativeWindowService, useValue: window },
          { provide: REQUEST, useValue: {} },
          { provide: Router, useValue: routerStub },
          { provide: RouteService, useValue: routeServiceStub },
          { provide: ActivatedRoute, useValue: routeStub },
          { provide: Store, useValue: mockStore },
          { provide: EPersonDataService, useValue: mockEpersonDataService },
          { provide: HardRedirectService, useValue: hardRedirectService },
          { provide: NotificationsService, useValue: NotificationsServiceStub },
          { provide: TranslateService, useValue: getMockTranslateService() },
          CookieService,
          AuthService,
        ],
      });
      authService = TestBed.inject(AuthService);
    });

    it('should return the authentication status object when user credentials are correct', () => {
      authService.authenticate('user', 'password').subscribe((status: AuthStatus) => {
        expect(status).toBeDefined();
      });
    });

    it('should throw an error when user credentials are wrong', () => {
      expect(authService.authenticate.bind(null, 'user', 'passwordwrong')).toThrow();
    });

    it('should return the authenticated user href when user token is valid', () => {
      authService.authenticatedUser(new AuthTokenInfo('test_token')).subscribe((userHref: string) => {
        expect(userHref).toBeDefined();
      });
    });

    it('should return the authenticated user', () => {
      authService.retrieveAuthenticatedUserByHref(EPersonMock._links.self.href).subscribe((user: EPerson) => {
        expect(user).toBeDefined();
      });
    });

    it('should throw an error when user credentials when user token is not valid', () => {
      expect(authService.authenticatedUser.bind(null, new AuthTokenInfo('test_token_expired'))).toThrow();
    });

    it('should return a valid refreshed token', () => {
      authService.refreshAuthenticationToken(new AuthTokenInfo('test_token')).subscribe((tokenState: AuthTokenInfo) => {
        expect(tokenState).toBeDefined();
      });
    });

    it('should throw an error when is not possible to refresh token', () => {
      expect(authService.refreshAuthenticationToken.bind(null, new AuthTokenInfo('test_token_expired'))).toThrow();
    });

    it('should return true when logout succeeded', () => {
      authService.logout().subscribe((status: boolean) => {
        expect(status).toBe(true);
      });
    });

    it('should throw an error when logout is not succeeded', () => {
      expect(authService.logout.bind(null)).toThrow();
    });

    it('should return the authentication status object to check an Authentication Cookie', () => {
      authService.checkAuthenticationCookie().subscribe((status: AuthStatus) => {
        expect(status).toBeDefined();
      });
    });

    it('should return the authentication methods available', () => {
      const authStatus = new AuthStatus();

      authService.retrieveAuthMethodsFromAuthStatus(authStatus).subscribe((authMethods: AuthMethod[]) => {
        expect(authMethods).toBeDefined();
        expect(authMethods.length).toBe(0);
      });

      authStatus.authMethods = authMethodsMock;
      authService.retrieveAuthMethodsFromAuthStatus(authStatus).subscribe((authMethods: AuthMethod[]) => {
        expect(authMethods).toBeDefined();
        expect(authMethods.length).toBe(2);
      });
    });

    describe('setIdle true', () => {
      beforeEach(() => {
        authService.setIdle(true);
      });

      it('store should dispatch SetUserAsIdleAction', () => {
        expect(mockStore.dispatch).toHaveBeenCalledWith(new SetUserAsIdleAction());
      });
    });

    describe('setIdle false', () => {
      beforeEach(() => {
        authService.setIdle(false);
      });

      it('store should dispatch UnsetUserAsIdleAction', () => {
        expect(mockStore.dispatch).toHaveBeenCalledWith(new UnsetUserAsIdleAction());
      });
    });
  });

  describe('', () => {

    beforeEach(waitForAsync(() => {
      init();
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({ authReducer }, {
            runtimeChecks: {
              strictStateImmutability: false,
              strictActionImmutability: false,
            },
          }),
        ],
        providers: [
          { provide: AuthRequestService, useValue: authRequest },
          { provide: REQUEST, useValue: {} },
          { provide: Router, useValue: routerStub },
          { provide: RouteService, useValue: routeServiceStub },
          { provide: RemoteDataBuildService, useValue: linkService },
          CookieService,
          AuthService,
        ],
      }).compileComponents();
    }));

    beforeEach(inject([CookieService, AuthRequestService, Store, Router, RouteService], (cookieService: CookieService, authReqService: AuthRequestService, store: Store<CoreState>, router: Router, routeService: RouteService, notificationsService: NotificationsService, translateService: TranslateService) => {
      store
        .subscribe((state) => {
          (state as any).core = Object.create({});
          (state as any).core.auth = authenticatedState;
        });
      authService = new AuthService({}, window, undefined, authReqService, mockEpersonDataService, router, routeService, cookieService, store, hardRedirectService, notificationsService, translateService);
    }));

    it('should return true when user is logged in', () => {
      authService.isAuthenticated().subscribe((status: boolean) => {
        expect(status).toBe(true);
      });
    });

    it('should return the shortlived token when user is logged in', () => {
      authService.getShortlivedToken().subscribe((shortlivedToken: string) => {
        expect(shortlivedToken).toEqual(authRequest.mockShortLivedToken);
      });
    });

    it('should return token object when it is valid', () => {
      authService.hasValidAuthenticationToken().subscribe((tokenState: AuthTokenInfo) => {
        expect(tokenState).toBe(token);
      });
    });

    it('should return a token object', () => {
      const result = authService.getToken();
      expect(result).toBe(token);
    });

    it('should return false when token is not expired', () => {
      const result = authService.isTokenExpired();
      expect(result).toBe(false);
    });

    it('should return true when authentication is loaded', () => {
      authService.isAuthenticationLoaded().subscribe((status: boolean) => {
        expect(status).toBe(true);
      });
    });

    it('isUserIdle should return false when user is not yet idle', () => {
      authService.isUserIdle().subscribe((status: boolean) => {
        expect(status).toBe(false);
      });
    });

  });

  describe('', () => {
    beforeEach(waitForAsync(() => {
      init();
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({ authReducer }, {
            runtimeChecks: {
              strictStateImmutability: false,
              strictActionImmutability: false,
            },
          }),
        ],
        providers: [
          { provide: AuthRequestService, useValue: authRequest },
          { provide: REQUEST, useValue: {} },
          { provide: Router, useValue: routerStub },
          { provide: RouteService, useValue: routeServiceStub },
          { provide: RemoteDataBuildService, useValue: linkService },
          ClientCookieService,
          CookieService,
          AuthService,
        ],
      }).compileComponents();
    }));

    beforeEach(inject([ClientCookieService, AuthRequestService, Store, Router, RouteService], (cookieService: ClientCookieService, authReqService: AuthRequestService, store: Store<CoreState>, router: Router, routeService: RouteService, notificationsService: NotificationsService, translateService: TranslateService) => {
      const expiredToken: AuthTokenInfo = new AuthTokenInfo('test_token');
      expiredToken.expires = Date.now() - (1000 * 60 * 60);
      authenticatedState = {
        authenticated: true,
        loaded: true,
        loading: false,
        authToken: expiredToken,
        user: EPersonMock,
      };
      store
        .subscribe((state) => {
          (state as any).core = Object.create({});
          (state as any).core.auth = authenticatedState;
        });
      authService = new AuthService({}, window, undefined, authReqService, mockEpersonDataService, router, routeService, cookieService, store, hardRedirectService, notificationsService, translateService);
      storage = (authService as any).storage;
      routeServiceMock = TestBed.inject(RouteService);
      routerStub = TestBed.inject(Router);
      spyOn(storage, 'get');
      spyOn(storage, 'remove');
      spyOn(storage, 'set');

    }));

    it('should throw false when token is not valid', () => {
      expect(authService.hasValidAuthenticationToken.bind(null)).toThrow();
    });

    it('should return true when token is expired', () => {
      const result = authService.isTokenExpired();
      expect(result).toBe(true);
    });

    it('should save token into storage', () => {
      authService.storeToken(token);
      expect(storage.set).toHaveBeenCalled();
    });

    it('should remove token from storage', () => {
      authService.removeToken();
      expect(storage.remove).toHaveBeenCalled();
    });

    it('should redirect to reload with redirect url', () => {
      authService.navigateToRedirectUrl('/collection/123');
      // Reload with redirect URL set to /collection/123
      expect(hardRedirectService.redirect).toHaveBeenCalledWith(jasmine.stringMatching(new RegExp('reload/[0-9]*\\?redirect=' + encodeURIComponent('/collection/123'))));
    });

    it('should redirect to reload with /home', () => {
      authService.navigateToRedirectUrl('/home');
      // Reload with redirect URL set to /home
      expect(hardRedirectService.redirect).toHaveBeenCalledWith(jasmine.stringMatching(new RegExp('reload/[0-9]*\\?redirect=' + encodeURIComponent('/home'))));
    });

    it('should redirect to regular reload and not to /login', () => {
      authService.navigateToRedirectUrl('/login');
      // Reload without a redirect URL
      expect(hardRedirectService.redirect).toHaveBeenCalledWith(jasmine.stringMatching(new RegExp('reload/[0-9]*(?!\\?)$')));
    });

    it('should redirect to regular reload when no redirect url is found', () => {
      authService.navigateToRedirectUrl(undefined);
      // Reload without a redirect URL
      expect(hardRedirectService.redirect).toHaveBeenCalledWith(jasmine.stringMatching(new RegExp('reload/[0-9]*(?!\\?)$')));
    });

    describe('impersonate', () => {
      const userId = 'testUserId';

      beforeEach(() => {
        spyOn(authService, 'refreshAfterLogout');
        authService.impersonate(userId);
      });

      it('should impersonate user', () => {
        expect(storage.set).toHaveBeenCalledWith(IMPERSONATING_COOKIE, userId);
      });

      it('should call refreshAfterLogout', () => {
        expect(authService.refreshAfterLogout).toHaveBeenCalled();
      });
    });

    describe('stopImpersonating', () => {
      beforeEach(() => {
        authService.stopImpersonating();
      });

      it('should impersonate user', () => {
        expect(storage.remove).toHaveBeenCalledWith(IMPERSONATING_COOKIE);
      });
    });

    describe('stopImpersonatingAndRefresh', () => {
      beforeEach(() => {
        spyOn(authService, 'refreshAfterLogout');
        authService.stopImpersonatingAndRefresh();
      });

      it('should impersonate user', () => {
        expect(storage.remove).toHaveBeenCalledWith(IMPERSONATING_COOKIE);
      });

      it('should call refreshAfterLogout', () => {
        expect(authService.refreshAfterLogout).toHaveBeenCalled();
      });
    });

    describe('getImpersonateID', () => {
      beforeEach(() => {
        authService.getImpersonateID();
      });

      it('should impersonate user', () => {
        expect(storage.get).toHaveBeenCalledWith(IMPERSONATING_COOKIE);
      });
    });

    describe('isImpersonating', () => {
      const userId = 'testUserId';
      let result: boolean;

      describe('when the cookie doesn\'t contain a value', () => {
        beforeEach(() => {
          result = authService.isImpersonating();
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });

      describe('when the cookie contains a value', () => {
        beforeEach(() => {
          storage.get = jasmine.createSpy().and.returnValue(userId);
          result = authService.isImpersonating();
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });
    });

    describe('isImpersonatingUser', () => {
      const userId = 'testUserId';
      let result: boolean;

      describe('when the cookie doesn\'t contain a value', () => {
        beforeEach(() => {
          result = authService.isImpersonatingUser(userId);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });

      describe('when the cookie contains the right value', () => {
        beforeEach(() => {
          storage.get = jasmine.createSpy().and.returnValue(userId);
          result = authService.isImpersonatingUser(userId);
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });

      describe('when the cookie contains the wrong value', () => {
        beforeEach(() => {
          storage.get = jasmine.createSpy().and.returnValue('wrongValue');
          result = authService.isImpersonatingUser(userId);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('refreshAfterLogout', () => {
      it('should call navigateToRedirectUrl with no url', () => {
        spyOn(authService as any, 'navigateToRedirectUrl').and.stub();
        authService.refreshAfterLogout();
        expect((authService as any).navigateToRedirectUrl).toHaveBeenCalled();
      });
    });

    describe('getSpecialGroupsFromAuthStatus', () => {
      beforeEach(() => {
        spyOn(authRequest, 'getRequest').and.returnValue(createSuccessfulRemoteDataObject$(AuthStatusWithSpecialGroups));
      });

      it('should call navigateToRedirectUrl with no url', () => {
        const expectRes = cold('(a|)', {
          a: SpecialGroupDataMock,
        });
        expect(authService.getSpecialGroupsFromAuthStatus()).toBeObservable(expectRes);
      });
    });
  });

  describe('when user is not logged in', () => {
    beforeEach(waitForAsync(() => {
      init();
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({ authReducer }, {
            runtimeChecks: {
              strictStateImmutability: false,
              strictActionImmutability: false,
            },
          }),
        ],
        providers: [
          { provide: AuthRequestService, useValue: authRequest },
          { provide: REQUEST, useValue: {} },
          { provide: Router, useValue: routerStub },
          { provide: RouteService, useValue: routeServiceStub },
          { provide: RemoteDataBuildService, useValue: linkService },
          CookieService,
          AuthService,
        ],
      }).compileComponents();
    }));

    beforeEach(inject([CookieService, AuthRequestService, Store, Router, RouteService], (cookieService: CookieService, authReqService: AuthRequestService, store: Store<CoreState>, router: Router, routeService: RouteService, notificationsService: NotificationsService, translateService: TranslateService) => {
      store
        .subscribe((state) => {
          (state as any).core = Object.create({});
          (state as any).core.auth = unAuthenticatedState;
        });
      authService = new AuthService({}, window, undefined, authReqService, mockEpersonDataService, router, routeService, cookieService, store, hardRedirectService, notificationsService, translateService);
    }));

    it('should return null for the shortlived token', () => {
      authService.getShortlivedToken().subscribe((shortlivedToken: string) => {
        expect(shortlivedToken).toBeNull();
      });
    });
  });

  describe('when user is idle', () => {
    beforeEach(waitForAsync(() => {
      init();
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({ authReducer }, {
            runtimeChecks: {
              strictStateImmutability: false,
              strictActionImmutability: false,
            },
          }),
        ],
        providers: [
          { provide: AuthRequestService, useValue: authRequest },
          { provide: REQUEST, useValue: {} },
          { provide: Router, useValue: routerStub },
          { provide: RouteService, useValue: routeServiceStub },
          { provide: RemoteDataBuildService, useValue: linkService },
          CookieService,
          AuthService,
        ],
      }).compileComponents();
    }));

    beforeEach(inject([CookieService, AuthRequestService, Store, Router, RouteService], (cookieService: CookieService, authReqService: AuthRequestService, store: Store<CoreState>, router: Router, routeService: RouteService, notificationsService: NotificationsService, translateService: TranslateService) => {
      store
        .subscribe((state) => {
          (state as any).core = Object.create({});
          (state as any).core.auth = idleState;
        });
      authService = new AuthService({}, window, undefined, authReqService, mockEpersonDataService, router, routeService, cookieService, store, hardRedirectService, notificationsService, translateService);
    }));

    it('isUserIdle should return true when user is not idle', () => {
      authService.isUserIdle().subscribe((status: boolean) => {
        expect(status).toBe(true);
      });
    });
  });
});
