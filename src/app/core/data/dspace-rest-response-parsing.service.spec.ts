import { getMockObjectCacheService } from '../../shared/mocks/object-cache.service.mock';
import { ObjectCacheService } from '../cache/object-cache.service';
import { RawRestResponse } from '../dspace-rest/raw-rest-response.model';
import { DspaceRestResponseParsingService } from './dspace-rest-response-parsing.service';
import { RestRequest } from './rest-request.model';
import { RestRequestMethod } from './rest-request-method';

class TestService extends DspaceRestResponseParsingService {
  constructor(protected objectCache: ObjectCacheService) {
    super(objectCache);
  }

  public ensureSelfLinkForTest(request: RestRequest, response: RawRestResponse): RawRestResponse {
    return this.ensureSelfLink(request, response);
  }
}

describe('DspaceRestResponseParsingService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService(getMockObjectCacheService());
  });

  describe('ensureSelfLink', () => {
    let warnSpy: jasmine.Spy;

    beforeEach(() => {
      warnSpy = spyOn(console, 'warn');
    });

    it('does not replace self link when only query params differ', () => {
      const request = {
        uuid: 'request-id',
        href: 'https://rest.test/server/api/core/items/f639b124-1234-1234-1234-abcdef123456?projection=preventMetadataSecurity',
        method: RestRequestMethod.GET,
      } as RestRequest;
      const response: RawRestResponse = {
        payload: {
          _links: {
            self: {
              href: 'https://rest.test/server/api/core/items/f639b124-1234-1234-1234-abcdef123456',
            },
          },
        },
        statusCode: 200,
        statusText: 'OK',
      };

      const result = service.ensureSelfLinkForTest(request, response);

      expect(result.payload._links.self.href).toBe('https://rest.test/server/api/core/items/f639b124-1234-1234-1234-abcdef123456');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('replaces self link when path differs', () => {
      const request = {
        uuid: 'request-id',
        href: 'https://rest.test/server/api/core/items/f639b124-1234-1234-1234-abcdef123456',
        method: RestRequestMethod.GET,
      } as RestRequest;
      const response: RawRestResponse = {
        payload: {
          _links: {
            self: {
              href: 'https://rest.test/server/api/core/items/some-other-id',
            },
          },
        },
        statusCode: 200,
        statusText: 'OK',
      };

      const result = service.ensureSelfLinkForTest(request, response);

      expect(result.payload._links.self.href).toBe('https://rest.test/server/api/core/items/f639b124-1234-1234-1234-abcdef123456');
      expect(warnSpy).toHaveBeenCalled();
    });
  });
});

