import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  Store,
  StoreModule,
} from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';

import { storeModuleConfig } from '../../../../app.reducer';
import { authReducer } from '@dspace/core';
import { AuthService } from '@dspace/core';
import { AuthMethod } from '@dspace/core';
import { AuthMethodType } from '@dspace/core';
import { AuthorizationDataService } from '@dspace/core';
import { HardRedirectService } from '@dspace/core';
import { ActivatedRouteStub } from '@dspace/core';
import { AuthServiceStub } from '@dspace/core';
import { AuthorizationDataServiceStub } from '@dspace/core';
import { getMockThemeService } from '../../../mocks/theme-service.mock';
import { ThemeService } from '../../../theme-support/theme.service';
import { LogInPasswordComponent } from './log-in-password.component';

describe('LogInPasswordComponent', () => {

  let component: LogInPasswordComponent;
  let fixture: ComponentFixture<LogInPasswordComponent>;
  let page: Page;
  let initialState: any;
  let hardRedirectService: HardRedirectService;
  let themeService = getMockThemeService();

  beforeEach(() => {
    hardRedirectService = jasmine.createSpyObj('hardRedirectService', {
      getCurrentRoute: {},
    });

    initialState = {
      core: {
        auth: {
          authenticated: false,
          loaded: false,
          blocking: false,
          loading: false,
          authMethods: [],
        },
      },
    };
  });

  beforeEach(waitForAsync(() => {
    // refine the test module by declaring the test component
    void TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot({ auth: authReducer }, storeModuleConfig),
        TranslateModule.forRoot(),
        LogInPasswordComponent,
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: AuthorizationDataService, useClass: AuthorizationDataServiceStub },
        { provide: 'authMethodProvider', useValue: new AuthMethod(AuthMethodType.Password, 0) },
        { provide: 'isStandalonePage', useValue: true },
        { provide: HardRedirectService, useValue: hardRedirectService },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: ThemeService, useValue: themeService },
        provideMockStore({ initialState }),
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
      .compileComponents();

  }));

  beforeEach(async () => {
    // create component and test fixture
    fixture = TestBed.createComponent(LogInPasswordComponent);

    // get test component from the fixture
    component = fixture.componentInstance;

    // create page
    page = new Page(component, fixture);

    // verify the fixture is stable (no pending tasks)
    await fixture.whenStable();
    page.addPageElements();
  });

  it('should create a FormGroup comprised of FormControls', () => {
    fixture.detectChanges();
    expect(component.form instanceof UntypedFormGroup).toBe(true);
  });

  it('should authenticate', () => {
    fixture.detectChanges();

    // set FormControl values
    component.form.controls.email.setValue('user');
    component.form.controls.password.setValue('password');

    // submit form
    component.submit();

    // verify Store.dispatch() is invoked
    expect(page.navigateSpy.calls.any()).toBe(true, 'Store.dispatch not invoked');
  });

});

/**
 * I represent the DOM elements and attach spies.
 *
 * @class Page
 */
class Page {

  public emailInput: HTMLInputElement;
  public navigateSpy: jasmine.Spy;
  public passwordInput: HTMLInputElement;

  constructor(private component: LogInPasswordComponent, private fixture: ComponentFixture<LogInPasswordComponent>) {
    // use injector to get services
    const injector = fixture.debugElement.injector;
    const store = injector.get(Store);

    // add spies
    this.navigateSpy = spyOn(store, 'dispatch');
  }

  public addPageElements() {
    const emailInputSelector = 'input[formcontrolname=\'email\']';
    this.emailInput = this.fixture.debugElement.query(By.css(emailInputSelector)).nativeElement;

    const passwordInputSelector = 'input[formcontrolname=\'password\']';
    this.passwordInput = this.fixture.debugElement.query(By.css(passwordInputSelector)).nativeElement;
  }
}
