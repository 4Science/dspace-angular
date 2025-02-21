import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import {
  cold,
  getTestScheduler,
} from 'jasmine-marbles';
import { of as observableOf } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { BrowseService } from '../browse';
import { ObjectCacheService } from '../cache';
import { RestResponse } from '../cache';
import { CoreState } from '@dspace/core';
import { getMockRemoteDataBuildService } from '../mocks';
import { getMockRequestService } from '../mocks';
import { NotificationsService } from '@dspace/core';
import { ExternalSourceEntry } from '../shared';
import { HALEndpointServiceStub } from '../utilities';
import { testCreateDataImplementation } from './base';
import { testDeleteDataImplementation } from './base';
import { testPatchDataImplementation } from './base';
import { FindListOptions } from '@dspace/core';
import { ItemDataService } from '@dspace/core';
import {
  DeleteRequest,
  PostRequest,
} from '@dspace/core';
import { RequestService } from '@dspace/core';
import { RequestEntry } from '@dspace/core';

describe('ItemDataService', () => {
  let scheduler: TestScheduler;
  let service: ItemDataService;
  let browseService: BrowseService;
  const requestService = Object.assign(getMockRequestService(), {
    generateRequestId(): string {
      return scopeID;
    },
    getByHref(requestHref: string) {
      const responseCacheEntry = new RequestEntry();
      responseCacheEntry.response = new RestResponse(true, 200, 'OK');
      return observableOf(responseCacheEntry);
    },
    removeByHrefSubstring(href: string) {
      // Do nothing
    },
  }) as RequestService;
  const rdbService = getMockRemoteDataBuildService();

  const itemEndpoint = 'https://rest.api/core';

  const store = {} as Store<CoreState>;
  const objectCache = {} as ObjectCacheService;
  const halEndpointService: any = new HALEndpointServiceStub(itemEndpoint);
  const bundleService = jasmine.createSpyObj('bundleService', {
    findByHref: {},
  });

  const scopeID = '4af28e99-6a9c-4036-a199-e1b587046d39';
  const options = Object.assign(new FindListOptions(), {
    scopeID: scopeID,
    sort: {
      field: '',
      direction: undefined,
    },
  });

  const browsesEndpoint = 'https://rest.api/discover/browses';
  const itemBrowseEndpoint = `${browsesEndpoint}/author/items`;
  const scopedEndpoint = `${itemBrowseEndpoint}?scope=${scopeID}`;
  const serviceEndpoint = `https://rest.api/core/items`;
  const browseError = new Error('getBrowseURL failed');
  const notificationsService = {} as NotificationsService;
  const http = {} as HttpClient;
  const comparator = {} as any;
  const ScopedItemEndpoint = `https://rest.api/core/items/${scopeID}`;

  function initMockBrowseService(isSuccessful: boolean) {
    const obs = isSuccessful ?
      cold('--a-', { a: itemBrowseEndpoint }) :
      cold('--#-', undefined, browseError);
    return jasmine.createSpyObj('bs', {
      getBrowseURLFor: obs,
    });
  }

  function initTestService() {
    return new ItemDataService(
      requestService,
      rdbService,
      objectCache,
      halEndpointService,
      notificationsService,
      comparator,
      browseService,
      bundleService,
    );
  }

  describe('composition', () => {
    const initService = () => new ItemDataService(null, null, null, null, null, null, null, null);
    testCreateDataImplementation(initService);
    testPatchDataImplementation(initService);
    testDeleteDataImplementation(initService);
  });

  describe('getBrowseEndpoint', () => {
    beforeEach(() => {
      scheduler = getTestScheduler();
    });

    it('should return the endpoint to fetch Items within the given scope and starting with the given string', () => {
      browseService = initMockBrowseService(true);
      service = initTestService();

      const result = service.getBrowseEndpoint(options);
      const expected = cold('--b-', { b: scopedEndpoint });

      expect(result).toBeObservable(expected);
    });

    describe('if the dc.date.issue browse isn\'t configured for items', () => {
      beforeEach(() => {
        browseService = initMockBrowseService(false);
        service = initTestService();
      });
      it('should throw an error', () => {
        const result = service.getBrowseEndpoint(options);
        const expected = cold('--#-', undefined, browseError);

        expect(result).toBeObservable(expected);
      });
    });
  });

  describe('removeMappingFromCollection', () => {
    let result;

    beforeEach(() => {
      service = initTestService();
      result = service.removeMappingFromCollection('item-id', 'collection-id');
    });

    it('should send a DELETE request', () => {
      result.subscribe(() => expect(requestService.send).toHaveBeenCalledWith(jasmine.any(DeleteRequest)));
    });
  });

  describe('mapToCollection', () => {
    let result;

    beforeEach(() => {
      service = initTestService();
      result = service.mapToCollection('item-id', 'collection-href');
    });

    it('should send a POST request', () => {
      result.subscribe(() => expect(requestService.send).toHaveBeenCalledWith(jasmine.any(PostRequest)));
    });
  });

  describe('importExternalSourceEntry', () => {
    let result;

    const externalSourceEntry = Object.assign(new ExternalSourceEntry(), {
      display: 'John, Doe',
      value: 'John, Doe',
      _links: { self: { href: 'http://test-rest.com/server/api/integration/externalSources/orcidV2/entryValues/0000-0003-4851-8004' } },
    });

    beforeEach(() => {
      service = initTestService();
      result = service.importExternalSourceEntry(externalSourceEntry, 'collection-id');
    });

    it('should send a POST request', (done) => {
      result.subscribe(() => {
        expect(requestService.send).toHaveBeenCalledWith(jasmine.any(PostRequest));
        done();
      });
    });
  });

  describe('createBundle', () => {
    const itemId = '3de6ea60-ec39-419b-ae6f-065930ac1429';
    const bundleName = 'ORIGINAL';
    let result;

    beforeEach(() => {
      service = initTestService();
      result = service.createBundle(itemId, bundleName);
    });

    it('should send a POST request', (done) => {
      result.subscribe(() => {
        expect(requestService.send).toHaveBeenCalledWith(jasmine.any(PostRequest));
        done();
      });
    });
  });

  describe('when cache is invalidated', () => {
    beforeEach(() => {
      service = initTestService();
    });
    it('should call setStaleByHrefSubstring', () => {
      service.invalidateItemCache('uuid');
      expect(requestService.setStaleByHrefSubstring).toHaveBeenCalledWith('item/uuid');
    });
  });

});
