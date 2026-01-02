import {
  NO_ERRORS_SCHEMA,
  PLATFORM_ID,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import {
  LogOutAction,
  RefreshEpersonAndTokenRedirectAction,
} from '../../core/auth/auth.actions';
import { AuthService } from '../../core/auth/auth.service';
import { AuthTokenInfo } from '../../core/auth/models/auth-token-info.model';
import { EndUserAgreementService } from '../../core/end-user-agreement/end-user-agreement.service';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { ActivatedRouteStub } from '../../shared/testing/active-router.stub';
import { EndUserAgreementComponent } from './end-user-agreement.component';
import { EndUserAgreementContentComponent } from './end-user-agreement-content/end-user-agreement-content.component';

describe('EndUserAgreementComponent', () => {
  let component: EndUserAgreementComponent;
  let fixture: ComponentFixture<EndUserAgreementComponent>;

  let endUserAgreementService: EndUserAgreementService;
  let notificationsService: NotificationsService;
  let authService: AuthService;
  let store;
  let router: Router;
  let route: ActivatedRoute;

  let redirectUrl: string;

  let token: AuthTokenInfo;

  function init() {
    redirectUrl = 'redirect/url';
    token = new AuthTokenInfo('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

    endUserAgreementService = jasmine.createSpyObj('endUserAgreementService', {
      hasCurrentUserOrCookieAcceptedAgreement: of(false),
      setUserAcceptedAgreement: of(true),
    });
    notificationsService = jasmine.createSpyObj('notificationsService', ['success', 'error', 'warning']);
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: of(true),
      getToken: token,
    });
    store = jasmine.createSpyObj('store', ['dispatch']);
    router = jasmine.createSpyObj('router', ['navigate', 'navigateByUrl']);
    route = Object.assign(new ActivatedRouteStub(), {
      queryParams: of({
        redirect: redirectUrl,
      }),
    }) as any;
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), EndUserAgreementComponent, BtnDisabledDirective],
      providers: [
        { provide: EndUserAgreementService, useValue: endUserAgreementService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuthService, useValue: authService },
        { provide: Store, useValue: store },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EndUserAgreementComponent, {
        remove: {
          imports: [EndUserAgreementContentComponent],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUserAgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when the user hasn\'t accepted the agreement', () => {
    beforeEach(() => {
      (endUserAgreementService.hasCurrentUserOrCookieAcceptedAgreement as jasmine.Spy).and.returnValue(of(false));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should initialize the accepted property', () => {
      expect(component.accepted).toEqual(false);
    });

    it('should disable the save button', () => {
      const button = fixture.debugElement.query(By.css('#button-save')).nativeElement;
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.classList.contains('disabled')).toBeTrue();
    });

    describe('when user checks the chcexbox ', () => {

      beforeEach(() => {
        component.accepted = true;
        fixture.detectChanges();
      });

      it('button should be enabled', () => {
        const button = fixture.debugElement.query(By.css('#button-save')).nativeElement;
        expect(button.disabled).toBeFalse();
      });

      describe('submit', () => {
        describe('when accepting the agreement was successful', () => {
          beforeEach(() => {
            (endUserAgreementService.setUserAcceptedAgreement as jasmine.Spy).and.returnValue(of(true));
            component.submit();
          });

          it('should display a success notification', () => {
            expect(notificationsService.success).toHaveBeenCalled();
          });

          it('should refresh the token and navigate the user to the redirect url', () => {
            expect(store.dispatch).toHaveBeenCalledWith(new RefreshEpersonAndTokenRedirectAction(token, redirectUrl));
          });
        });

        describe('when accepting the agreement was unsuccessful', () => {
          beforeEach(() => {
            (endUserAgreementService.setUserAcceptedAgreement as jasmine.Spy).and.returnValue(of(false));
            component.submit();
          });

          it('should display an error notification', () => {
            expect(notificationsService.error).toHaveBeenCalled();
          });
        });
      });

    });

  });

  describe('when the user has already accepted the agreement', () => {

    beforeEach(() => {
      (endUserAgreementService.hasCurrentUserOrCookieAcceptedAgreement as jasmine.Spy).and.returnValue(observableOf(true));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should initialize the accepted property', () => {
      expect(component.accepted).toEqual(true);
    });

    it('should initialize the alreadyAccepted property', () => {
      expect(component.alreadyAccepted).toEqual(true);
    });

    it('should not show form', () => {
      const form = fixture.debugElement.query(By.css('.form-user-agreement-accept'));
      expect(form).toBeNull();
    });

  });

  describe('cancel', () => {
    describe('when the user is authenticated', () => {
      beforeEach(() => {
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(of(true));
        component.cancel();
      });

      it('should logout the user', () => {
        expect(store.dispatch).toHaveBeenCalledWith(new LogOutAction());
      });
    });

    describe('when the user is not authenticated', () => {
      beforeEach(() => {
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(of(false));
        component.cancel();
      });

      it('should navigate the user to the homepage', () => {
        expect(router.navigate).toHaveBeenCalledWith(['home']);
      });
    });
  });

  describe('warning notification logic', () => {
    beforeEach(() => {
      (endUserAgreementService.hasCurrentUserOrCookieAcceptedAgreement as jasmine.Spy)
        .and.returnValue(observableOf(false));
      fixture.detectChanges();
    });

    it('should show warning once when not accepted and in browser', () => {
      component.ngOnInit();
      expect(notificationsService.warning).toHaveBeenCalledTimes(1);
      component.initAccepted(); // call again
      expect(notificationsService.warning).toHaveBeenCalledTimes(1);
    });

    it('should not show warning when already accepted', () => {
      component.ngOnInit();
      (notificationsService.warning as jasmine.Spy).calls.reset();
      (endUserAgreementService.hasCurrentUserOrCookieAcceptedAgreement as jasmine.Spy)
        .and.returnValue(observableOf(true));
      component.initAccepted();
      expect(notificationsService.warning).not.toHaveBeenCalled();
    });

    it('should not show warning when not in browser', () => {
      (component as any).platformId = 'server';
      fixture.detectChanges();
      (notificationsService.warning as jasmine.Spy).calls.reset();
      component.ngOnInit();
      component.initAccepted();
      expect(notificationsService.warning).toHaveBeenCalledTimes(0);
    });
  });
});
