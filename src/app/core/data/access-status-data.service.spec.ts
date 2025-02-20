import {
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { hasNoValue } from '@dspace/shared/utils';
import { Observable } from 'rxjs';

import { getMockRequestService } from '../../shared/mocks/request.service.mock';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { Item } from '../shared/item.model';
import { createSuccessfulRemoteDataObject$ } from '../utilities/remote-data.utils';
import { HALEndpointServiceStub } from '../utilities/testing/hal-endpoint-service.stub';
import { NotificationsServiceStub } from '../utilities/testing/notifications-service.stub';
import { AccessStatusDataService } from './access-status-data.service';
import { RemoteData } from './remote-data';
import { GetRequest } from './request.models';
import { RequestService } from './request.service';

const url = 'fake-url';

describe('AccessStatusDataService', () => {
  let service: AccessStatusDataService;
  let requestService: RequestService;
  let notificationsService: any;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let halService: any;

  const itemId = '8b3c613a-5a4b-438b-9686-be1d5b4a1c5a';
  const mockItem: Item = Object.assign(new Item(), {
    id: itemId,
    name: 'test-item',
    _links: {
      accessStatus: {
        href: `https://rest.api/items/${itemId}/accessStatus`,
      },
      self: {
        href: `https://rest.api/items/${itemId}`,
      },
    },
  });

  describe('when the requests are successful', () => {
    beforeEach(() => {
      createService();
    });

    describe('when calling findAccessStatusFor', () => {
      let contentSource$;

      beforeEach(() => {
        contentSource$ = service.findAccessStatusFor(mockItem);
      });

      it('should send a new GetRequest', fakeAsync(() => {
        contentSource$.subscribe();
        tick();
        expect(requestService.send).toHaveBeenCalledWith(jasmine.any(GetRequest), true);
      }));
    });
  });

  /**
   * Create an AccessStatusDataService used for testing
   * @param response$   Supply a RemoteData to be returned by the REST API (optional)
   */
  function createService(response$?: Observable<RemoteData<any>>) {
    requestService = getMockRequestService();
    let buildResponse$ = response$;
    if (hasNoValue(response$)) {
      buildResponse$ = createSuccessfulRemoteDataObject$({});
    }
    rdbService = jasmine.createSpyObj('rdbService', {
      buildFromRequestUUID: buildResponse$,
      buildSingle: buildResponse$,
    });
    objectCache = jasmine.createSpyObj('objectCache', {
      remove: jasmine.createSpy('remove'),
    });
    halService = new HALEndpointServiceStub(url);
    notificationsService = new NotificationsServiceStub();
    service = new AccessStatusDataService(requestService, rdbService, objectCache, halService);
  }
});
