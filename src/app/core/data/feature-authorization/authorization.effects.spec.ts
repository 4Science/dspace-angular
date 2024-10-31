import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { AuthorizationEffects } from './authorization.effects';
import { AppState } from '../../../app.reducer';
import { mockAuthSiteObject } from './authorizations.mock';
import { authorizationReducer } from './authorization.reducer';
import { SiteDataService } from '../site-data.service';
import { AuthorizationActionTypes, GetAuthorizationsSuccessAction } from './authorization.actions';
import { environment } from '../../../../environments/environment';
import { AuthorizationDataService } from './authorization-data.service';
import { AuthorizationDataServiceStub } from '../../../shared/testing/authorization-service.stub';



describe('AuthorizationEffects', () => {
  let authorizationEffects: AuthorizationEffects;
  let actions: Observable<any>;
  let initialState;
  let store: MockStore<AppState>;
  let scheduler: TestScheduler;

  const siteService = jasmine.createSpyObj(['find']);

  function init() {
    siteService.find.and.returnValue(of(mockAuthSiteObject));

    initialState = {
      authorizationFeatures: {
        loading: false,
        hasError: false,
        authorizations: {}
      }
    };
  }

  beforeEach(() => {
    init();
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ authorizationReducer }, {
          runtimeChecks: {
            strictStateImmutability: false,
            strictActionImmutability: false
          }
        }),
      ],
      providers: [
        { provide: SiteDataService, useValue: siteService },
        { provide: AuthorizationDataService, useClass: AuthorizationDataServiceStub },
        AuthorizationEffects,
        provideMockStore({ initialState }),
        provideMockActions(() => actions),
      ],
    });

    authorizationEffects = TestBed.inject(AuthorizationEffects);
    store = TestBed.inject(Store as any);
  });

  describe('getAuthorizations$', () => {
    describe('when request is successful', () => {
      it('should return a GET_AUTHORIZATION_SUCCESS action in response to a GET_AUTHORIZATION action', (done) => {
        const featureIDs = environment.siteAuthorizationFeaturesConfig;
        actions = hot('--a-', {
          a: {
            type: AuthorizationActionTypes.GET_AUTHORIZATIONS,
            payload: { uuidList: [mockAuthSiteObject.uuid], type: mockAuthSiteObject.uniqueType, featureIDs: featureIDs }
          }
        });

        const expected = cold('--b-', { b: new GetAuthorizationsSuccessAction({})});

        expect(authorizationEffects.getAuthorizations$).toBeObservable(expected);
        done();
      });
    });
  });

});
