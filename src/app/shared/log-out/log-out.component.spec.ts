import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { Router } from '@angular/router';
import {
  Store,
  StoreModule,
} from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { AppState } from '../../app.reducer';
import { authReducer } from '../../core/auth/auth.reducer';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { BrowserOnlyMockPipe } from '../testing/browser-only-mock.pipe';
import { EPersonMock } from '../testing/eperson.mock';
import { RouterStub } from '../testing/router.stub';
import { LogOutComponent } from './log-out.component';

describe('LogOutComponent', () => {

  let component: LogOutComponent;
  let fixture: ComponentFixture<LogOutComponent>;
  let page: Page;
  let user: EPerson;

  const authState = {
    authenticated: false,
    loaded: false,
    loading: false,
  };
  const routerStub = new RouterStub();

  beforeEach(() => {
    user = EPersonMock;
  });

  beforeEach(waitForAsync(() => {
    // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        StoreModule.forRoot(authReducer, {
          runtimeChecks: {
            strictStateImmutability: false,
            strictActionImmutability: false,
          },
        }),
        TranslateModule.forRoot(),
      ],
      declarations: [
        LogOutComponent,
        BrowserOnlyMockPipe,
      ],
      providers: [
        { provide: Router, useValue: routerStub },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
      ],
    })
      .compileComponents();

  }));

  beforeEach(inject([Store], (store: Store<AppState>) => {
    store
      .subscribe((state) => {
        (state as any).core = Object.create({});
        (state as any).core.auth = authState;
      });

    // create component and test fixture
    fixture = TestBed.createComponent(LogOutComponent);

    // get test component from the fixture
    component = fixture.componentInstance;

    // create page
    page = new Page(component, fixture);

  }));

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should log out', () => {
    fixture.detectChanges();

    // submit form
    component.logOut();

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

  public navigateSpy: jasmine.Spy;

  constructor(private component: LogOutComponent, private fixture: ComponentFixture<LogOutComponent>) {
    // use injector to get services
    const injector = fixture.debugElement.injector;
    const store = injector.get(Store);

    // add spies
    this.navigateSpy = spyOn(store, 'dispatch');
  }

}
