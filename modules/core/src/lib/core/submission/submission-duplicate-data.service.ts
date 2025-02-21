/* eslint-disable max-classes-per-file */
import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import { Observable } from 'rxjs';

import { Duplicate } from '../data/duplicate-data/duplicate.model';
import { RemoteDataBuildService } from '../cache';
import { RequestParam } from '../cache';
import { ObjectCacheService } from '../cache';
import { BaseDataService } from '../data';
import {
  SearchData,
  SearchDataImpl,
} from '../data';
import { FindListOptions } from '../data';
import { FollowLinkConfig } from '../data';
import { PaginatedList } from '../data';
import { ResponseParsingService } from '../data';
import { RemoteData } from '../data';
import { GetRequest } from '../data';
import { RequestService } from '../data';
import { RestRequest } from '../data';
import { SearchResponseParsingService } from '../data';
import { GenericConstructor } from '../shared';
import { HALEndpointService } from '../shared';

/**
 * Service that handles search requests for potential duplicate items.
 * This uses the /api/submission/duplicates endpoint to look for other archived or in-progress items (if user
 * has READ permission) that match the item (for the given uuid).
 * Matching is configured in the backend in dspace/config/modulesduplicate-detection.cfg
 * The returned results are small preview 'stubs' of items, and displayed in either a submission section
 * or the workflow pooled/claimed task page.
 *
 */
@Injectable({ providedIn: 'root' })
export class SubmissionDuplicateDataService extends BaseDataService<Duplicate>
  implements SearchData<Duplicate>, OnDestroy {

  /**
   * The ResponseParsingService constructor name
   */
  private parser: GenericConstructor<ResponseParsingService> = SearchResponseParsingService;

  /**
   * The RestRequest constructor name
   */
  private request: GenericConstructor<RestRequest> = GetRequest;

  /**
   * SearchData interface to implement
   * @private
   */
  private searchData: SearchData<Duplicate>;

  /**
   * Subscription to unsubscribe from
   */
  private sub;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('duplicates', requestService, rdbService, objectCache, halService);
    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  /**
   * Implement the searchBy method to return paginated lists of Duplicate resources
   *
   * @param searchMethod the search method name
   * @param options find list options
   * @param useCachedVersionIfAvailable whether to use cached version if available
   * @param reRequestOnStale whether to rerequest results on stale
   * @param linksToFollow links to follow in results
   */
  searchBy(searchMethod: string, options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<Duplicate>[]): Observable<RemoteData<PaginatedList<Duplicate>>> {
    return this.searchData.searchBy(searchMethod, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  /**
   * Helper method to get the duplicates endpoint
   * @protected
   */
  protected getEndpoint(): Observable<string> {
    return this.halService.getEndpoint(this.linkPath);
  }

  /**
   * Method to set service options
   * @param {GenericConstructor<ResponseParsingService>} parser The ResponseParsingService constructor name
   * @param {boolean} request The RestRequest constructor name
   */
  setServiceOptions(parser: GenericConstructor<ResponseParsingService>, request: GenericConstructor<RestRequest>) {
    if (parser) {
      this.parser = parser;
    }
    if (request) {
      this.request = request;
    }
  }

  /**
   * Find duplicates for a given item UUID. Locates and returns results from the /api/submission/duplicates/search/findByItem
   * SearchRestMethod, which is why this implements SearchData<Duplicate> and searchBy
   *
   * @param uuid the item UUID
   * @param options any find list options e.g. paging
   * @param useCachedVersionIfAvailable whether to use cached version if available
   * @param reRequestOnStale whether to rerequest results on stale
   * @param linksToFollow links to follow in results
   */
  public findDuplicates(uuid: string, options?: FindListOptions, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Duplicate>[]): Observable<RemoteData<PaginatedList<Duplicate>>> {
    const searchParams = [new RequestParam('uuid', uuid)];
    let findListOptions = new FindListOptions();
    if (options) {
      findListOptions = Object.assign(new FindListOptions(), options);
    }
    if (findListOptions.searchParams) {
      findListOptions.searchParams = [...findListOptions.searchParams, ...searchParams];
    } else {
      findListOptions.searchParams = searchParams;
    }

    // Return actual search/findByItem results
    return this.searchBy('findByItem', findListOptions, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);

  }

  /**
   * Unsubscribe from the subscription
   */
  ngOnDestroy(): void {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }
}
