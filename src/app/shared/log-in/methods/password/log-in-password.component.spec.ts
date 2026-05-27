import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  of,
} from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { AuthMethod } from '../../../../core/auth/models/auth.method';
import { AuthMethodType } from '../../../../core/auth/models/auth.method-type';
import { AuthorizationDataService } from '../../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../../core/data/feature-authorization/feature-id';
import { HardRedirectService } from '../../../../core/services/hard-redirect.service';
import { LogInPasswordComponent } from './log-in-password.component';

describe('LogInPasswordComponent', () => {
  let component: LogInPasswordComponent;
  let fixture: ComponentFixture<LogInPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let hardRedirectService: jasmine.SpyObj<HardRedirectService>;
  let store: jasmine.SpyObj<Store>;
  let authorizationService: jasmine.SpyObj<AuthorizationDataService>;
  let activatedRoute: any;

  const mockAuthMethod: AuthMethod = {
    authMethodType: AuthMethodType.Password,
    position: 1,
    location: 'http://localhost:8080/server/api/authn/password',
  };

  const errorSubject = new BehaviorSubject<string>(null);
  const messageSubject = new BehaviorSubject<string>(null);

  beforeEach(waitForAsync(() => {
    authService = jasmine.createSpyObj('AuthService', ['setRedirectUrl', 'setRedirectUrlIfNotSet']);
    hardRedirectService = jasmine.createSpyObj('HardRedirectService', ['getCurrentRoute']);
    store = jasmine.createSpyObj('Store', ['dispatch', 'pipe', 'select']);
    authorizationService = jasmine.createSpyObj('AuthorizationDataService', ['isAuthorized']);

    activatedRoute = {
      data: of({ isBackDoor: false }),
    };

    hardRedirectService.getCurrentRoute.and.returnValue('/test-route');
    store.pipe.and.returnValue(of(null));
    store.select = jasmine.createSpy('select').and.callFake((selector) => {
      if (selector.toString().includes('getAuthenticationError')) {
        return errorSubject.asObservable();
      }
      if (selector.toString().includes('getAuthenticationInfo')) {
        return messageSubject.asObservable();
      }
      return of(null);
    });

    authorizationService.isAuthorized.and.returnValue(of(true));

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        LogInPasswordComponent,
      ],
      providers: [
        { provide: 'authMethodProvider', useValue: mockAuthMethod },
        { provide: 'isStandalonePage', useValue: false },
        { provide: AuthService, useValue: authService },
        { provide: HardRedirectService, useValue: hardRedirectService },
        { provide: Store, useValue: store },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogInPasswordComponent);
    component = fixture.componentInstance;
    errorSubject.next(null);
    messageSubject.next(null);
    fixture.detectChanges();
  });

  afterEach(() => {
    errorSubject.next(null);
    messageSubject.next(null);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize the form with email and password controls', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('email')).toBeDefined();
      expect(component.form.get('password')).toBeDefined();
    });

    it('should set email and password as required fields', () => {
      const emailControl = component.form.get('email');
      const passwordControl = component.form.get('password');

      emailControl.setValue('');
      passwordControl.setValue('');

      expect(emailControl.valid).toBeFalsy();
      expect(passwordControl.valid).toBeFalsy();
      expect(emailControl.hasError('required')).toBeTruthy();
      expect(passwordControl.hasError('required')).toBeTruthy();
    });

    it('should check registration authorization', (done) => {
      component.canRegister$.subscribe((canRegister) => {
        expect(authorizationService.isAuthorized).toHaveBeenCalledWith(FeatureID.EPersonRegistration);
        expect(canRegister).toBeTrue();
        done();
      });
    });

    it('should check forgot password authorization', (done) => {
      component.canForgot$.subscribe((canForgot) => {
        expect(authorizationService.isAuthorized).toHaveBeenCalledWith(FeatureID.EPersonForgotPassword);
        expect(canForgot).toBeTrue();
        done();
      });
    });

    it('should show divider when user can register or reset password', (done) => {
      authorizationService.isAuthorized.and.returnValue(of(true));
      component.ngOnInit();

      component.canShowDivider$.subscribe((canShow) => {
        expect(canShow).toBeTrue();
        done();
      });
    });

    it('should not show divider when isBackDoor is true', (done) => {
      activatedRoute.data = of({ isBackDoor: true });
      authorizationService.isAuthorized.and.returnValue(of(true));
      component.ngOnInit();

      // canShowDivider$ filters out false values, so it won't emit
      let emitted = false;
      component.canShowDivider$.subscribe(() => {
        emitted = true;
      });

      setTimeout(() => {
        expect(emitted).toBeFalse();
        done();
      }, 100);
    });
  });

  describe('getRegisterRoute', () => {
    it('should return the register route', () => {
      const route = component.getRegisterRoute();
      expect(route).toBe('/register');
    });
  });

  describe('getForgotRoute', () => {
    it('should return the forgot password route', () => {
      const route = component.getForgotRoute();
      expect(route).toBe('/forgot');
    });
  });

  describe('authorization scenarios', () => {
    it('should handle when user cannot register or forgot password', (done) => {
      authorizationService.isAuthorized.and.returnValue(of(false));
      component.ngOnInit();

      let emitted = false;
      component.canShowDivider$.subscribe(() => {
        emitted = true;
      });

      setTimeout(() => {
        expect(emitted).toBeFalse();
        done();
      }, 100);
    });

    it('should show divider when user can only register', (done) => {
      authorizationService.isAuthorized.and.callFake((featureId) => {
        if (featureId === FeatureID.EPersonRegistration) {
          return of(true);
        }
        return of(false);
      });
      component.ngOnInit();

      component.canShowDivider$.subscribe((canShow) => {
        expect(canShow).toBeTrue();
        done();
      });
    });

    it('should show divider when user can only forgot password', (done) => {
      authorizationService.isAuthorized.and.callFake((featureId) => {
        if (featureId === FeatureID.EPersonForgotPassword) {
          return of(true);
        }
        return of(false);
      });
      component.ngOnInit();

      component.canShowDivider$.subscribe((canShow) => {
        expect(canShow).toBeTrue();
        done();
      });
    });
  });
});
