import { TestScheduler } from 'rxjs/testing';
import { RequestService } from '../data/request.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { DefaultChangeAnalyzer } from '../data/default-change-analyzer.service';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { RequestEntry } from '../data/request-entry.model';
import { RestResponse } from '../cache/response.models';
import { of as observableOf } from 'rxjs';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { RemoteData } from '../data/remote-data';
import { RequestEntryState } from '../data/request-entry-state.model';
import { RequestParam } from '../cache/models/request-param.model';
import { SuggestionSource } from './suggestions/models/suggestion-source.model';
import { SuggestionTarget } from './suggestions/models/suggestion-target.model';
import { SuggestionSourceDataService } from './suggestions/source/suggestion-source-data.service';
import { SuggestionTargetDataService } from './suggestions/target/suggestion-target-data.service';
import { SuggestionDataService } from './suggestions/suggestion-data.service';
import { Suggestion } from './suggestions/models/suggestion.model';

describe('SuggestionDataService test', () => {
  let scheduler: TestScheduler;
  let service: SuggestionDataService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let http: HttpClient;
  let comparatorSuggestion: DefaultChangeAnalyzer<Suggestion>;
  let comparatorSuggestionSource: DefaultChangeAnalyzer<SuggestionSource>;
  let comparatorSuggestionTarget: DefaultChangeAnalyzer<SuggestionTarget>;
  let suggestionSourcesDataService: SuggestionSourceDataService;
  let suggestionTargetsDataService: SuggestionTargetDataService;
  let suggestionsDataService: SuggestionDataService;
  let responseCacheEntry: RequestEntry;


  const testSource = 'test-source';
  const testUserId = '1234-4321';
  const endpointURL = `https://rest.api/rest/api/`;
  const requestUUID = '8b3c613a-5a4b-438b-9686-be1d5b4a1c5a';
  const remoteDataMocks = {
    Success: new RemoteData(null, null, null, RequestEntryState.Success, null, null, 200),
  };

  function initTestService() {
    return new SuggestionDataService(
      requestService,
      rdbService,
      objectCache,
      halService,
      notificationsService,
      http
    );
  }

  beforeEach(() => {
    scheduler = getTestScheduler();

    objectCache = {} as ObjectCacheService;
    http = {} as HttpClient;
    notificationsService = {} as NotificationsService;
    comparatorSuggestion = {} as DefaultChangeAnalyzer<Suggestion>;
    comparatorSuggestionTarget = {} as DefaultChangeAnalyzer<SuggestionTarget>;
    comparatorSuggestionSource = {} as DefaultChangeAnalyzer<SuggestionSource>;
    responseCacheEntry = new RequestEntry();
    responseCacheEntry.request = { href: 'https://rest.api/' } as any;
    responseCacheEntry.response = new RestResponse(true, 200, 'Success');

    requestService = jasmine.createSpyObj('requestService', {
      generateRequestId: requestUUID,
      send: true,
      removeByHrefSubstring: {},
      getByHref: observableOf(responseCacheEntry),
      getByUUID: observableOf(responseCacheEntry),
      setStaleByHrefSubstring: observableOf(true)
    });

    halService = jasmine.createSpyObj('halService', {
      getEndpoint: observableOf(endpointURL)
    });

    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: createSuccessfulRemoteDataObject$({}, 500),
      buildList: cold('a', { a: remoteDataMocks.Success })
    });


    suggestionSourcesDataService = jasmine.createSpyObj('suggestionSourcesDataService', {
      getSources: observableOf(null),
    });

    suggestionTargetsDataService = jasmine.createSpyObj('suggestionTargetsDataService', {
      getTargets: observableOf(null),
      getTargetsByUser: observableOf(null),
      findById: observableOf(null),
    });

    suggestionsDataService = jasmine.createSpyObj('suggestionsDataService', {
      searchBy: observableOf(null),
      delete: observableOf(null),
    });


    service = initTestService();
    /* eslint-disable-next-line @typescript-eslint/dot-notation */
    service['suggestionSourcesDataService'] = suggestionSourcesDataService;
    /* eslint-disable-next-line @typescript-eslint/dot-notation */
    service['suggestionTargetsDataService'] = suggestionTargetsDataService;
    /* eslint-disable-next-line @typescript-eslint/dot-notation */
    service['suggestionsDataService'] = suggestionsDataService;
  });

  describe('Suggestion service', () => {
    it('should call suggestionsDataService.searchBy', () => {
      spyOn((service as any).searchData, 'searchBy').and.returnValue(observableOf(null));
      const options = {
        searchParams: [new RequestParam('target', testUserId), new RequestParam('source', testSource)],
      };
      service.getSuggestionsByTargetAndSource(testUserId, testSource);
      expect((service as any).searchData.searchBy).toHaveBeenCalledWith('findByTargetAndSource', options, false, true);
    });

    it('should call suggestionsDataService.delete', () => {
      spyOn((service as any).deleteData, 'delete').and.returnValue(observableOf(null));
      service.deleteSuggestion('1');
      expect((service as any).deleteData.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('Request service', () => {
    it('should call requestService.setStaleByHrefSubstring', () => {
      service.clearSuggestionRequests();
      expect(requestService.setStaleByHrefSubstring).toHaveBeenCalled();
    });
  });
});
