import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import {
  cold,
  getTestScheduler,
} from 'jasmine-marbles';
import { of as observableOf } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { RemoteDataBuildService } from '../../../cache';
import { ObjectCacheService } from '../../../cache';
import { RestResponse } from '../../../cache';
import { CoreState } from '../../../core-state.model';
import { FindAllData } from '../../../data';
import { testFindAllDataImplementation } from '../../../data';
import { DefaultChangeAnalyzer } from '../../../data';
import { RemoteData } from '../../../data';
import { GetRequest } from '../../../data';
import { RequestService } from '../../../data';
import { RequestEntry } from '../../../data';
import { RequestEntryState } from '../../../data';
import { HALEndpointService } from '../../../shared';
import { createSuccessfulRemoteDataObject$ } from '../../../utilities';
import { NotificationsService } from '../../notifications.service';
import { SuggestionSource } from '../models';
import { SuggestionSourceDataService } from './suggestion-source-data.service';

describe('SuggestionSourceDataService test', () => {
  let scheduler: TestScheduler;
  let service: SuggestionSourceDataService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let http: HttpClient;
  let comparator: DefaultChangeAnalyzer<SuggestionSource>;
  let responseCacheEntry: RequestEntry;

  const store = {} as Store<CoreState>;
  const endpointURL = `https://rest.api/rest/api/suggestionsources`;
  const requestUUID = '8b3c613a-5a4b-438b-9686-be1d5b4a1c5a';

  const remoteDataMocks = {
    Success: new RemoteData(null, null, null, RequestEntryState.Success, null, null, 200),
  };

  function initTestService() {
    return new SuggestionSourceDataService(
      requestService,
      rdbService,
      store,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator,
    );
  }

  beforeEach(() => {
    scheduler = getTestScheduler();

    objectCache = {} as ObjectCacheService;
    http = {} as HttpClient;
    notificationsService = {} as NotificationsService;
    comparator = {} as DefaultChangeAnalyzer<SuggestionSource>;
    responseCacheEntry = new RequestEntry();
    responseCacheEntry.request = { href: 'https://rest.api/' } as any;
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');

    requestService = jasmine.createSpyObj('requestService', {
      generateRequestId: requestUUID,
      send: true,
      removeByHrefSubstring: {},
      getByHref: observableOf(responseCacheEntry),
      getByUUID: observableOf(responseCacheEntry),
    });

    halService = jasmine.createSpyObj('halService', {
      getEndpoint: observableOf(endpointURL),
    });

    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: createSuccessfulRemoteDataObject$({}, 500),
      buildList: cold('a', { a: remoteDataMocks.Success }),
    });


    service = initTestService();
  });

  describe('composition', () => {
    const initFindAllService = () => new SuggestionSourceDataService(null, null, null, null, null, null, null, null) as unknown as FindAllData<any>;
    testFindAllDataImplementation(initFindAllService);
  });

  describe('getSources', () => {
    it('should send a new GetRequest', () => {
      const expected = new GetRequest(requestService.generateRequestId(),  `${endpointURL}`);
      scheduler.schedule(() => service.getSources().subscribe());
      scheduler.flush();

      expect(requestService.send).toHaveBeenCalledWith(expected, true);
    });
  });

  describe('getSource', () => {
    it('should send a new GetRequest', () => {
      const expected = new GetRequest(requestService.generateRequestId(),  `${endpointURL}/testId`);
      scheduler.schedule(() => service.getSource('testId').subscribe());
      scheduler.flush();

      expect(requestService.send).toHaveBeenCalledWith(expected, true);
    });
  });
});
