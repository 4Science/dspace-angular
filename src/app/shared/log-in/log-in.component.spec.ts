import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthMethodType } from 'src/app/core/auth/models/auth.method-type';

import { authReducer } from '../../core/auth/auth.reducer';
import { AuthService } from '../../core/auth/auth.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { HardRedirectService } from '../../core/services/hard-redirect.service';
import { NativeWindowService } from '../../core/services/window.service';
import { ThemedLoadingComponent } from '../loading/themed-loading.component';
import { NativeWindowMockFactory } from '../mocks/mock-native-window-ref';
import { getMockThemeService } from '../mocks/theme-service.mock';
import { ActivatedRouteStub } from '../testing/active-router.stub';
import {
  authMethodsMock,
  AuthServiceStub,
} from '../testing/auth-service.stub';
import { createTestComponent } from '../testing/utils.test';
import { ThemeService } from '../theme-support/theme.service';
import { LogInContainerComponent } from './container/log-in-container.component';
import { LogInComponent } from './log-in.component';

describe('LogInComponent', () => {

  let component: LogInComponent;
  let fixture: ComponentFixture<LogInComponent>;
  const initialState = {
    core: {
      auth: {
        authenticated: false,
        loaded: false,
        loading: false,
        authMethods: authMethodsMock,
      },
    },
  };
  let hardRedirectService: HardRedirectService;

  let authorizationService: AuthorizationDataService;

  beforeEach(waitForAsync(() => {
    hardRedirectService = jasmine.createSpyObj('hardRedirectService', {
      redirect: {},
      getCurrentRoute: {},
    });
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: of(true),
    });

    // refine the test module by declaring the test component
    void TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot(authReducer, {
          runtimeChecks: {
            strictStateImmutability: false,
            strictActionImmutability: false,
          },
        }),
        RouterTestingModule,
        TranslateModule.forRoot(),
        TestComponent,
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: NativeWindowService, useFactory: NativeWindowMockFactory },
        // { provide: Router, useValue: new RouterStub() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: HardRedirectService, useValue: hardRedirectService },
        { provide: AuthorizationDataService, useValue: authorizationService },
        provideMockStore({ initialState }),
        { provide: ThemeService, useValue: getMockThemeService() },
        LogInComponent,
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
      .overrideComponent(LogInComponent, { remove: { imports: [ThemedLoadingComponent, LogInContainerComponent] } }).compileComponents();

  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `<ds-log-in [isStandalonePage]="isStandalonePage"> </ds-log-in>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create LogInComponent', inject([LogInComponent], (app: LogInComponent) => {

      expect(app).toBeDefined();

    }));
  });

  describe('', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(LogInComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    afterEach(() => {
      fixture.destroy();
      component = null;
    });

    it('should render a log-in container component for each auth method available', () => {
      const loginContainers = fixture.debugElement.queryAll(By.css('ds-log-in-container'));
      expect(loginContainers.length).toBe(1);

    });

    it('returns only password method when backdoor is enabled', () => {
      const authMethods = [
        { authMethodType: AuthMethodType.Password, position: 1 },
        { authMethodType: AuthMethodType.Ip, position: 2 },
        { authMethodType: AuthMethodType.Shibboleth, position: 3 },
      ];
      const isBackdoor = true;
      component.excludedAuthMethod = undefined;
      const result = component.filterAndSortAuthMethods(authMethods, isBackdoor);
      expect(result).toEqual([{ authMethodType: AuthMethodType.Password, position: 1 }]);
    });

    it('does not exclude password method when standard login is disabled', () => {
      const authMethods = [
        { authMethodType: AuthMethodType.Password, position: 1 },
        { authMethodType: AuthMethodType.Shibboleth, position: 2 },
      ];
      component.excludedAuthMethod = undefined;
      const result = component.filterAndSortAuthMethods(authMethods, false, true);
      expect(result).toEqual([
        { authMethodType: AuthMethodType.Password, position: 1 },
        { authMethodType: AuthMethodType.Shibboleth, position: 2 },
      ]);
    });

    it('excludes methods based on excludedAuthMethod input', () => {
      const authMethods = [
        { authMethodType: AuthMethodType.Password, position: 1 },
        { authMethodType: AuthMethodType.Ip, position: 2 },
        { authMethodType: AuthMethodType.Shibboleth, position: 3 },
      ];
      const isBackdoor = false;
      component.excludedAuthMethod = AuthMethodType.Ip;
      const result = component.filterAndSortAuthMethods(authMethods, isBackdoor);
      expect(result).toEqual([
        { authMethodType: AuthMethodType.Shibboleth, position: 3 },
      ]);
    });

    it('sorts methods by position', () => {
      const authMethods = [
        { authMethodType: AuthMethodType.Password, position: 2 },
        { authMethodType: AuthMethodType.Shibboleth, position: 1 },
      ];
      const isBackdoor = false;
      component.excludedAuthMethod = undefined;
      const result = component.filterAndSortAuthMethods(authMethods, isBackdoor);
      expect(result).toEqual([
        { authMethodType: AuthMethodType.Shibboleth, position: 1 },
      ]);
    });
  });

});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    RouterTestingModule],
})
class TestComponent {

  isStandalonePage = true;

}
