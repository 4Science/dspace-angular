import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of } from 'rxjs';
import { AuthorizationEffects } from './authorization.effects';
import { mockAuthSiteObject } from './authorizations.mock';
import { authorizationReducer } from './authorization.reducer';
import { AuthorizationActionTypes, GetAuthorizationsAction, GetAuthorizationsErrorAction, GetAuthorizationsSuccessAction } from './authorization.actions';
import { environment } from '../../../../environments/environment';
import { AuthorizationDataService } from './authorization-data.service';
import { AuthorizationDataServiceStub } from '../../../shared/testing/authorization-service.stub';


let authorizationEffects: AuthorizationEffects;
let actions: Observable<any>;
let authorizationDataService = new AuthorizationDataServiceStub();
const featureIDs = environment.siteAuthorizationFeaturesConfig;

describe('AuthorizationEffects success', () => {

  afterEach(() => {
    authorizationEffects = null;
    authorizationDataService = null;
    TestBed.resetTestingModule();
  });

  beforeEach(() => {
    authorizationDataService = new AuthorizationDataServiceStub();

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
        { provide: AuthorizationDataService, useValue: authorizationDataService },
        AuthorizationEffects,
        provideMockActions(() => actions),
      ],
    });

    authorizationEffects = TestBed.inject(AuthorizationEffects);
  });

  describe('getAuthorizations$ when request is successful', () => {
    it('should return a GET_AUTHORIZATION_SUCCESS action in response to a GET_AUTHORIZATION action', (done) => {
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
describe('AuthorizationEffects error', () => {
  afterEach(() => {
    authorizationEffects = null;
    authorizationDataService = null;
    TestBed.resetTestingModule();
  });

  beforeEach(() => {
    authorizationDataService = new AuthorizationDataServiceStub(true);

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
        { provide: AuthorizationDataService, useValue: authorizationDataService },
        AuthorizationEffects,
        provideMockActions(() => actions),
      ],
    });

    authorizationEffects = TestBed.inject(AuthorizationEffects);
  });

  describe('getAuthorizations$ when request fails', () => {
    it('should return a new GetAuthorizationsErrorAction', (done) => {
      actions = of(new GetAuthorizationsAction([mockAuthSiteObject.uuid], mockAuthSiteObject.uniqueType, featureIDs ));

      authorizationEffects.getAuthorizations$.subscribe(expected => {
        expect(expected).toEqual(new GetAuthorizationsErrorAction());
        done();
      });
    });
  });

});
