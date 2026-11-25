import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Observable,
  of,
} from 'rxjs';

import { hasValue } from '../../../shared/empty.util';
import { getMockObjectCacheService } from '../../../shared/mocks/object-cache.service.mock';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject$,
} from '../../../shared/remote-data.utils';
import { createPaginatedList } from '../../../shared/testing/utils.test';
import { RequestParam } from '../../cache/models/request-param.model';
import { EPerson } from '../../eperson/models/eperson.model';
import { Authorization } from '../../shared/authorization.model';
import { Feature } from '../../shared/feature.model';
import { Site } from '../../shared/site.model';
import { testSearchDataImplementation } from '../base/search-data.spec';
import { FindListOptions } from '../find-list-options.model';
import { SiteDataService } from '../site-data.service';
import { AuthorizationDataService } from './authorization-data.service';
import { FeatureID } from './feature-id';

describe('AuthorizationDataService', () => {
  let service: AuthorizationDataService;
  let siteService: SiteDataService;
  let objectCache;
  let authService;

  let site: Site;
  let ePerson: EPerson;

  const requestService = jasmine.createSpyObj('requestService', {
    setStaleByHrefSubstring: jasmine.createSpy('setStaleByHrefSubstring'),
  });

  function init() {
    site = Object.assign(new Site(), {
      id: 'test-site',
      type: 'core.site',
      _links: {
        self: { href: 'test-site-href' },
      },
    });
    ePerson = Object.assign(new EPerson(), {
      id: 'test-eperson',
      uuid: 'test-eperson',
    });
    siteService = jasmine.createSpyObj('siteService', {
      find: of(site),
    });

    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: of(true),
      isAuthenticationReady: of(true),
    });
    objectCache = getMockObjectCacheService();
    service = new AuthorizationDataService(requestService, undefined, objectCache, undefined, siteService, authService);
  }

  beforeEach(() => {
    init();
    spyOn(service, 'searchBy').and.returnValue(of(undefined));
  });

  describe('composition', () => {
    const initService = () => new AuthorizationDataService(null, null, null, null, null, null);
    testSearchDataImplementation(initService);
  });

  it('should call setStaleByHrefSubstring method', () => {
    service.invalidateAuthorizationsRequestCache();
    expect((service as any).requestService.setStaleByHrefSubstring).toHaveBeenCalledWith((service as any).linkPath);
  });

  describe('searchByObject', () => {
    const objectUrl = 'fake-object-url';
    const ePersonUuid = 'fake-eperson-uuid';

    function createExpected(providedObjectUrl: string, providedEPersonUuid?: string, providedFeatureId?: FeatureID): FindListOptions {
      const searchParams = [new RequestParam('uri', providedObjectUrl, false)];
      if (hasValue(providedFeatureId)) {
        searchParams.push(new RequestParam('feature', providedFeatureId));
      }
      if (hasValue(providedEPersonUuid)) {
        searchParams.push(new RequestParam('eperson', providedEPersonUuid));
      }
      return Object.assign(new FindListOptions(), { searchParams });
    }

    describe('when no arguments are provided', () => {
      beforeEach(() => {
        service.searchByObject().subscribe();
      });

      it('should call searchBy with the site\'s url', () => {
        expect(service.searchBy).toHaveBeenCalledWith('object', createExpected(site.self), true, true);
      });
    });

    describe('when no arguments except for a feature are provided', () => {
      beforeEach(() => {
        service.searchByObject(FeatureID.LoginOnBehalfOf).subscribe();
      });

      it('should call searchBy with the site\'s url and the feature', () => {
        expect(service.searchBy).toHaveBeenCalledWith('object', createExpected(site.self, null, FeatureID.LoginOnBehalfOf), true, true);
      });
    });

    describe('when a feature and object url are provided', () => {
      beforeEach(() => {
        service.searchByObject(FeatureID.LoginOnBehalfOf, objectUrl).subscribe();
      });

      it('should call searchBy with the object\'s url and the feature', () => {
        expect(service.searchBy).toHaveBeenCalledWith('object', createExpected(objectUrl, null, FeatureID.LoginOnBehalfOf), true, true);
      });
    });

    describe('when all arguments are provided', () => {
      beforeEach(() => {
        service.searchByObject(FeatureID.LoginOnBehalfOf, objectUrl, ePersonUuid).subscribe();
      });

      it('should call searchBy with the object\'s url, user\'s uuid and the feature', () => {
        expect(service.searchBy).toHaveBeenCalledWith('object', createExpected(objectUrl, ePersonUuid, FeatureID.LoginOnBehalfOf), true, true);
      });
    });

    describe('dependencies', () => {
      let addDependencySpy;

      beforeEach(() => {
        (service.searchBy as any).and.returnValue(of('searchBy RD$'));
        addDependencySpy = spyOn(service as any, 'addDependency');
      });

      it('should add a dependency on the objectUrl', (done) => {
        addDependencySpy.and.callFake((href$: Observable<string>, dependsOn$: Observable<string>) => {
          observableCombineLatest([href$, dependsOn$]).subscribe(([href, dependsOn]) => {
            expect(href).toBe('searchBy RD$');
            expect(dependsOn).toBe('object-href');
          });
        });

        service.searchByObject(FeatureID.AdministratorOf, 'object-href').subscribe(() => {
          expect(addDependencySpy).toHaveBeenCalled();
          done();
        });
      });

      it('should add a dependency on the Site object if no objectUrl is given', (done) => {
        addDependencySpy.and.callFake((object$: Observable<any>, dependsOn$: Observable<string>) => {
          observableCombineLatest([object$, dependsOn$]).subscribe(([object, dependsOn]) => {
            expect(object).toBe('searchBy RD$');
            expect(dependsOn).toBe('test-site-href');
          });
        });

        service.searchByObject(FeatureID.AdministratorOf).subscribe(() => {
          expect(addDependencySpy).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('searchByObjects', () => {
    const objectId = 'fake-object-id';
    const objectId2 = 'fake-object-id-2';
    const ePersonUuid = 'fake-eperson-uuid';

    function createExpected(providedObjectsUuid: string[], providedType: string, providedEPersonUuid?: string, providedFeaturesId?: FeatureID[]): FindListOptions {
      const searchParams = [];

      searchParams.push(new RequestParam('type', providedType));

      searchParams.push(...providedObjectsUuid.map(uuid => new RequestParam('uuid', uuid)));

      if (hasValue(providedFeaturesId)) {
        searchParams.push(...providedFeaturesId.map(id => new RequestParam('feature', id)));
      }
      if (hasValue(providedEPersonUuid)) {
        searchParams.push(new RequestParam('eperson', providedEPersonUuid));
      }
      return Object.assign(new FindListOptions(), { searchParams });
    }


    describe('when one feature and one object id are provided', () => {
      beforeEach(() => {
        service.searchByObjects([objectId], 'core.item', [FeatureID.LoginOnBehalfOf]).subscribe();
      });

      it('should call searchBy with a list made by object\'s uuid and a list of the features IDs', () => {
        expect(service.searchBy).toHaveBeenCalledWith('objects', createExpected([objectId], 'core.item', null, [FeatureID.LoginOnBehalfOf]), true, true);
      });
    });

    describe('when multiple values are provided', () => {
      beforeEach(() => {
        service.searchByObjects([objectId, objectId2], 'core.item', [FeatureID.AdministratorOf, FeatureID.IsCollectionAdmin], ePersonUuid).subscribe();
      });

      it('should call searchBy with the object\'s url, user\'s uuid and the feature', () => {
        expect(service.searchBy).toHaveBeenCalledWith('objects', createExpected([objectId, objectId2], 'core.item', ePersonUuid, [FeatureID.AdministratorOf, FeatureID.IsCollectionAdmin]), true, true);
      });
    });


  });

  describe('isAuthorized', () => {
    const featureID = FeatureID.AdministratorOf;
    const objectUrl = 'object-url';

    function authorizationFor(id: string): Authorization {
      return Object.assign(new Authorization(), {
        feature: createSuccessfulRemoteDataObject$(Object.assign(new Feature(), { id })),
      });
    }

    const validPayload = [authorizationFor('invalid-feature'), authorizationFor(featureID)];
    const invalidPayload = [authorizationFor('invalid-feature'), authorizationFor('another-invalid-feature')];

    beforeEach(() => {
      authService.isAuthenticated.and.returnValue(of(false));
    });

    describe('when searchByObject returns a 401', () => {
      beforeEach(() => {
        spyOn(service, 'searchByObject').and.returnValue(createFailedRemoteDataObject$('Unauthorized', 401));
      });

      it('should return false', (done) => {
        service.isAuthorized(featureID).subscribe((result) => {
          expect(result).toEqual(false);
          done();
        });
      });
    });

    describe('when searchByObject returns an empty list', () => {
      beforeEach(() => {
        spyOn(service, 'searchByObject').and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([])));
      });

      it('should return false', (done) => {
        service.isAuthorized(featureID).subscribe((result) => {
          expect(result).toEqual(false);
          done();
        });
      });
    });

    describe('when searchByObject returns a list without the feature', () => {
      beforeEach(() => {
        spyOn(service, 'searchByObject').and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList(invalidPayload)));
      });

      it('should return false', (done) => {
        service.isAuthorized(featureID).subscribe((result) => {
          expect(result).toEqual(false);
          done();
        });
      });
    });

    describe('when searchByObject returns a list with the feature', () => {
      beforeEach(() => {
        spyOn(service, 'searchByObject').and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList(validPayload)));
      });

      it('should return true, searching without a feature filter', (done) => {
        service.isAuthorized(featureID, objectUrl).subscribe((result) => {
          expect(result).toEqual(true);
          expect(service.searchByObject).toHaveBeenCalledTimes(1);
          expect((service.searchByObject as jasmine.Spy).calls.mostRecent().args[0]).toBeUndefined();
          expect((service.searchByObject as jasmine.Spy).calls.mostRecent().args[1]).toBe(objectUrl);
          done();
        });
      });

      it('should share one lookup between checks on the same object', (done) => {
        observableCombineLatest([
          service.isAuthorized(featureID, objectUrl),
          service.isAuthorized(FeatureID.CanDelete, objectUrl),
        ]).subscribe(([granted, notGranted]) => {
          expect(granted).toBeTrue();
          expect(notGranted).toBeFalse();
          expect(service.searchByObject).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('should look up again after the authorizations are invalidated', (done) => {
        service.isAuthorized(featureID, objectUrl).subscribe(() => {
          service.invalidateAuthorizationsRequestCache();
          service.isAuthorized(featureID, objectUrl).subscribe(() => {
            expect(service.searchByObject).toHaveBeenCalledTimes(2);
            done();
          });
        });
      });
    });

    describe('when the lookup of all the authorizations fails', () => {
      it('should fall back to the check of the single feature', (done) => {
        const searchSpy = spyOn(service, 'searchByObject').and.callFake((feature?: FeatureID) => feature
          ? createSuccessfulRemoteDataObject$(createPaginatedList(validPayload))
          : createFailedRemoteDataObject$('Error', 500));
        service.isAuthorized(featureID, objectUrl).subscribe((result) => {
          expect(result).toEqual(true);
          expect(searchSpy).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });

    describe('when an EPerson is provided', () => {
      it('should only check the single feature', (done) => {
        const searchSpy = spyOn(service, 'searchByObject').and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList(validPayload)));
        service.isAuthorized(featureID, objectUrl, 'eperson').subscribe((result) => {
          expect(result).toEqual(true);
          expect(searchSpy.calls.mostRecent().args[0]).toBe(featureID);
          expect(searchSpy.calls.mostRecent().args[2]).toBe('eperson');
          done();
        });
      });
    });

    describe('authentication state', () => {
      it('should batch checks for authenticated visitors too', () => {
        authService.isAuthenticated.and.returnValue(of(true));
        const search = spyOn(service, 'searchByObject').and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList(validPayload)));
        service.isAuthorized(featureID).subscribe((result) => expect(result).toBeTrue());
        expect(search.calls.mostRecent().args[0]).toBeUndefined();
        expect(search.calls.mostRecent().args[3]).toEqual({ elementsPerPage: 100 });
      });

      [true, false].forEach((authenticated) => {
        it(`should wait until authentication is ready (authenticated: ${authenticated})`, () => {
          const search = spyOn(service, 'searchByObject').and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList(validPayload)));
          const ready$ = new BehaviorSubject(false);
          authService.isAuthenticationReady.and.returnValue(ready$);
          authService.isAuthenticated.and.returnValue(of(authenticated));
          const result = jasmine.createSpy('result');
          service.isAuthorized(featureID, objectUrl).subscribe(result);
          expect(result).not.toHaveBeenCalled();
          expect(search).not.toHaveBeenCalled();
          ready$.next(true);
          expect(result).toHaveBeenCalledOnceWith(true);
          expect(search.calls.mostRecent().args[0]).toBeUndefined();
        });
      });
    });

    describe('when a batched result is available', () => {
      it('should use it without any further request', (done) => {
        spyOn(service, 'searchByObjects').and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([
          Object.assign(new Authorization(), {
            object: createSuccessfulRemoteDataObject$(Object.assign(new Site(), { _links: { self: { href: objectUrl } } })),
            feature: createSuccessfulRemoteDataObject$(Object.assign(new Feature(), { id: featureID })),
          }),
        ])));
        const searchSpy = spyOn(service, 'searchByObject');
        service.getAuthorizationForObjects(['uuid'], 'item', [featureID, FeatureID.CanDelete], undefined, [objectUrl]).subscribe((state) => {
          expect(state).toEqual({ [objectUrl]: { [featureID]: true, [FeatureID.CanDelete]: false } });
          observableCombineLatest([
            service.isAuthorized(featureID, objectUrl),
            service.isAuthorized(FeatureID.CanDelete, objectUrl),
          ]).subscribe(([granted, notGranted]) => {
            expect(granted).toBeTrue();
            expect(notGranted).toBeFalse();
            expect(searchSpy).not.toHaveBeenCalled();
            done();
          });
        });
      });
    });
  });
});
