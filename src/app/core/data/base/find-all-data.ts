/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';

import { isNotEmpty } from '../../../shared/empty.util';
import { FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { CacheableObject } from '../../cache/cacheable-object.model';
import { RequestParam } from '../../cache/models/request-param.model';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { FindListOptions } from '../find-list-options.model';
import { PaginatedList } from '../paginated-list.model';
import { RemoteData } from '../remote-data';
import { RequestService } from '../request.service';
import { BaseDataService } from './base-data.service';

/**
 * Interface for a data service that list all of its objects.
 */
export interface FindAllData<T extends CacheableObject> {
  /**
   * Returns {@link RemoteData} of all object with a list of {@link FollowLinkConfig}, to indicate which embedded
   * info should be added to the objects
   *
   * @param options                     Find list options object
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   * @return {Observable<RemoteData<PaginatedList<T>>>}
   *    Return an observable that emits object list
   */
  findAll(options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<T>[]): Observable<RemoteData<PaginatedList<T>>>;
}

/**
 * A UpdateDataServiceImpl feature to list all objects.
 *
 * Concrete data services can use this feature by implementing {@link FindAllData}
 * and delegating its method to an inner instance of this class.
 */
export class FindAllDataImpl<T extends CacheableObject> extends BaseDataService<T> implements FindAllData<T> {
  constructor(
    protected linkPath: string,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected responseMsToLive: number,
  ) {
    super(linkPath, requestService, rdbService, objectCache, halService, responseMsToLive);
  }

  /**
   * Returns {@link RemoteData} of all object with a list of {@link FollowLinkConfig}, to indicate which embedded
   * info should be added to the objects
   *
   * @param options                     Find list options object
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   * @return {Observable<RemoteData<PaginatedList<T>>>}
   *    Return an observable that emits object list
   */
  findAll(options: FindListOptions = {}, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<T>[]): Observable<RemoteData<PaginatedList<T>>> {
    return this.findListByHref(this.getFindAllHref(options), options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  /**
   * Returns {@link RemoteData} of all object with a list of {@link FollowLinkConfig}, to indicate which embedded
   * info should be added to the objects
   *
   * @param projections                 Array of string of projections to be added to the parameters
   * @param options                     Find list options object
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   * @return {Observable<RemoteData<PaginatedList<T>>>}
   *    Return an observable that emits object list
   */
  findAllWithProjection(projections: string[], options: FindListOptions = {}, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<T>[]): Observable<RemoteData<PaginatedList<T>>> {

    projections.forEach((projection) => {
      options.searchParams.push(new RequestParam('projection', projection));
    });

    return this.findListByHref(this.getFindAllHref(options), options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  /**
   * Create the HREF with given options object
   *
   * @param options The [[FindListOptions]] object
   * @param linkPath The link path for the object
   * @return {Observable<string>}
   *    Return an observable that emits created HREF
   * @param linksToFollow   List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved
   */
  getFindAllHref(options: FindListOptions = {}, linkPath?: string, ...linksToFollow: FollowLinkConfig<T>[]): Observable<string> {
    const args = [];

    const endpoint$ = this.getBrowseEndpoint(options).pipe(
      filter((href: string) => isNotEmpty(href)),
      map((href: string) => isNotEmpty(linkPath) ? `${href}/${linkPath}` : href),
      distinctUntilChanged(),
    );

    return endpoint$.pipe(map((result: string) => this.buildHrefFromFindOptions(result, options, args, ...linksToFollow)));
  }
}
