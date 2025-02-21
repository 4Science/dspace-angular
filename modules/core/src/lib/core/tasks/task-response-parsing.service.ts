import { Injectable } from '@angular/core';

import { ObjectCacheService } from '../cache';
import { ParsedResponse } from '../cache';
import { BaseResponseParsingService } from '../data';
import { ResponseParsingService } from '../data';
import { RestRequest } from '../data';
import { RawRestResponse } from '../dspace-rest';

/**
 * Provides methods to parse response for a task request.
 */
@Injectable({ providedIn: 'root' })
export class TaskResponseParsingService extends BaseResponseParsingService implements ResponseParsingService {

  protected toCache = false;

  /**
   * Initialize instance variables
   *
   * @param {ObjectCacheService} objectCache
   */
  constructor(protected objectCache: ObjectCacheService) {
    super();
  }

  /**
   * Parses data from the tasks endpoints
   *
   * @param {RestRequest} request
   * @param {RawRestResponse} data
   * @returns {RestResponse}
   */
  parse(request: RestRequest, data: RawRestResponse): ParsedResponse {
    if (this.isSuccessStatus(data.statusCode)) {
      return new ParsedResponse(data.statusCode);
    } else {
      throw new Error('Unexpected response from server');
    }
  }

}
