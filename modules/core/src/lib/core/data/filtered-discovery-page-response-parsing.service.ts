import { Injectable } from '@angular/core';

import { ObjectCacheService } from '../cache';
import {
  FilteredDiscoveryQueryResponse,
  RestResponse,
} from '../cache';
import { RawRestResponse } from '../dspace-rest';
import { BaseResponseParsingService } from './base-response-parsing.service';
import { ResponseParsingService } from './parsing.service';
import { RestRequest } from './rest-request.model';

/**
 * A ResponseParsingService used to parse RawRestResponse coming from the REST API to a discovery query (string)
 * wrapped in a FilteredDiscoveryQueryResponse
 */
@Injectable({ providedIn: 'root' })
export class FilteredDiscoveryPageResponseParsingService extends BaseResponseParsingService implements ResponseParsingService {
  objectFactory = {};
  toCache = false;
  constructor(
    protected objectCache: ObjectCacheService,
  ) {
    super();
  }

  /**
   * Parses data from the REST API to a discovery query wrapped in a FilteredDiscoveryQueryResponse
   * @param {RestRequest} request
   * @param {RawRestResponse} data
   * @returns {RestResponse}
   */
  parse(request: RestRequest, data: RawRestResponse): RestResponse {
    const query = data.payload['discovery-query'];
    return new FilteredDiscoveryQueryResponse(query, data.statusCode, data.statusText);
  }
}
