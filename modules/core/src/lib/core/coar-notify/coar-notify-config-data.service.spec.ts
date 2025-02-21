import {
  cold,
  getTestScheduler,
} from 'jasmine-marbles';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { RemoteDataBuildService } from '@dspace/core';
import { ObjectCacheService } from '@dspace/core';
import { RestResponse } from '@dspace/core';
import { CreateData } from '@dspace/core';
import { testCreateDataImplementation } from '@dspace/core';
import { DeleteData } from '@dspace/core';
import { testDeleteDataImplementation } from '@dspace/core';
import { FindAllData } from '@dspace/core';
import { testFindAllDataImplementation } from '@dspace/core';
import { PatchData } from '@dspace/core';
import { testPatchDataImplementation } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { RequestService } from '@dspace/core';
import { RequestEntry } from '@dspace/core';
import { RequestEntryState } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { HALEndpointService } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { CoarNotifyConfigDataService } from '@dspace/core';

describe('CoarNotifyConfigDataService test', () => {
  let scheduler: TestScheduler;
  let service: CoarNotifyConfigDataService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let responseCacheEntry: RequestEntry;

  const endpointURL = `https://rest.api/rest/api/coar-notify`;
  const requestUUID = '8b3c613a-5a4b-438b-9686-be1d5b4a1c5a';

  const remoteDataMocks = {
    Success: new RemoteData(null, null, null, RequestEntryState.Success, null, null, 200),
  };

  function initTestService() {
    return new CoarNotifyConfigDataService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
    );
  }

  beforeEach(() => {
    scheduler = getTestScheduler();

    objectCache = {} as ObjectCacheService;
    notificationsService = {} as NotificationsService;
    responseCacheEntry = new RequestEntry();
    responseCacheEntry.request = { href: 'https://rest.api/' } as any;
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');

    requestService = jasmine.createSpyObj('requestService', {
      generateRequestId: requestUUID,
      send: true,
      removeByHrefSubstring: {},
      getByHref: of(responseCacheEntry),
      getByUUID: of(responseCacheEntry),
    });

    halService = jasmine.createSpyObj('halService', {
      getEndpoint: of(endpointURL),
    });

    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: createSuccessfulRemoteDataObject$({}, 500),
      buildList: cold('a', { a: remoteDataMocks.Success }),
    });


    service = initTestService();
  });

  describe('composition', () => {
    const initCreateService = () => new CoarNotifyConfigDataService(null, null, null, null, null) as unknown as CreateData<any>;
    const initFindAllService = () => new CoarNotifyConfigDataService(null, null, null, null, null) as unknown as FindAllData<any>;
    const initDeleteService = () => new CoarNotifyConfigDataService(null, null, null, null, null) as unknown as DeleteData<any>;
    const initPatchService = () => new CoarNotifyConfigDataService(null, null, null, null, null) as unknown as PatchData<any>;
    testCreateDataImplementation(initCreateService);
    testFindAllDataImplementation(initFindAllService);
    testPatchDataImplementation(initPatchService);
    testDeleteDataImplementation(initDeleteService);
  });

});
