import { StoreModule } from '@ngrx/store';
import { AuthorizationService } from './authorization.service';
import { of } from 'rxjs';
import { SiteDataService } from '../site-data.service';
import { environment } from '../../../../environments/environment';
import { mockAuthSiteObject } from './authorizations.mock';
import { GetAuthorizationsAction } from './authorization.actions';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { authorizationReducer } from './authorization.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FeatureID } from './feature-id';


describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let store: MockStore;
  let memoizedSelector;


  const siteService = jasmine.createSpyObj('siteService', {
    find: jasmine.createSpy('find')
  });


  const initialState = {
    authorizationFeatures: {
      authorizations: {
        'f92d103c-e4ad-4dfb-b59f-f90c7425407e': {
          [FeatureID.AdministratorOf]: true
        }
      },
      loading: false,
      hasError: false
    }
  };



  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        StoreModule.forRoot({ authorizationReducer }, {
          runtimeChecks: {
            strictStateImmutability: false,
            strictActionImmutability: false
          }
        }),
      ],
      declarations: [],
      providers: [
        AuthorizationService,
        { provide: SiteDataService, useValue: siteService },
        provideMockStore({ initialState }),
      ],
    });

    service = TestBed.inject(AuthorizationService);
    store = TestBed.inject(MockStore);
    memoizedSelector = store.overrideSelector(service.getAllAuthorizations, initialState.authorizationFeatures.authorizations);

    siteService.find = jasmine.createSpy().and.returnValue(of(mockAuthSiteObject));

    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should return loading false on init', (done) => {
    service.isLoading().subscribe((loading) => {
      expect(loading).toBeFalsy();
      done();
    });
  });

  it('should return hasError false on init', (done) => {
    service.hasErrors().subscribe((hasError) => {
      expect(hasError).toBeFalsy();
      done();
    });
  });

  it('should call site service for site authorizations', fakeAsync(() => {

    service.initStateForSite(environment.siteAuthorizationFeaturesConfig);
    tick(100);

    expect(siteService.find).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(new GetAuthorizationsAction([mockAuthSiteObject.uuid], mockAuthSiteObject.uniqueType, environment.siteAuthorizationFeaturesConfig));
  }));

  it('should return a boolean for the authorization of a single object', (done) => {
    service.getAuthorizationForObject(FeatureID.AdministratorOf, mockAuthSiteObject.uuid).subscribe(result => {
      expect(result).toBeTruthy();
      done();
    });
  });
});
