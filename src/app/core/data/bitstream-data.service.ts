import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Operation,
  RemoveOperation,
} from 'fast-json-patch';
import {
  combineLatest as observableCombineLatest,
  EMPTY,
  Observable,
} from 'rxjs';
import {
  find,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { hasValue } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import {
  followLink,
  FollowLinkConfig,
} from '../../shared/utils/follow-link-config.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestParam } from '../cache/models/request-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HttpOptions } from '../dspace-rest/dspace-rest.service';
import { Bitstream } from '../shared/bitstream.model';
import { BitstreamFormat } from '../shared/bitstream-format.model';
import { Bundle } from '../shared/bundle.model';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Item } from '../shared/item.model';
import { NoContent } from '../shared/NoContent.model';
import { getFirstCompletedRemoteData } from '../shared/operators';
import { PageInfo } from '../shared/page-info.model';
import { sendRequest } from '../shared/request.operators';
import {
  DeleteData,
  DeleteDataImpl,
} from './base/delete-data';
import { IdentifiableDataService } from './base/identifiable-data.service';
import {
  PatchData,
  PatchDataImpl,
} from './base/patch-data';
import {
  SearchData,
  SearchDataImpl,
} from './base/search-data';
import { BitstreamFormatDataService } from './bitstream-format-data.service';
import { BundleDataService } from './bundle-data.service';
import { DSOChangeAnalyzer } from './dso-change-analyzer.service';
import { FindListOptions } from './find-list-options.model';
import {
  buildPaginatedList,
  PaginatedList,
} from './paginated-list.model';
import { RemoteData } from './remote-data';
import {
  PatchRequest,
  PutRequest,
} from './request.models';
import { RequestService } from './request.service';
import { RestRequestMethod } from './rest-request-method';

export interface MetadataFilter {
  metadataName: string;
  metadataValue: string;
}

/**
 * A service to retrieve {@link Bitstream}s from the REST API
 */
@Injectable({ providedIn: 'root' })
export class BitstreamDataService extends IdentifiableDataService<Bitstream> implements SearchData<Bitstream>, PatchData<Bitstream>, DeleteData<Bitstream> {
  private searchData: SearchDataImpl<Bitstream>;
  private patchData: PatchDataImpl<Bitstream>;
  private deleteData: DeleteDataImpl<Bitstream>;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected bundleService: BundleDataService,
    protected bitstreamFormatService: BitstreamFormatDataService,
    protected comparator: DSOChangeAnalyzer<Bitstream>,
    protected notificationsService: NotificationsService,
  ) {
    super('bitstreams', requestService, rdbService, objectCache, halService);

    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
    this.patchData = new PatchDataImpl<Bitstream>(this.linkPath, requestService, rdbService, objectCache, halService, comparator, this.responseMsToLive, this.constructIdEndpoint);
    this.deleteData = new DeleteDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive, this.constructIdEndpoint);
  }

  /**
   * Retrieves the {@link Bitstream}s in a given bundle
   *
   * @param bundle                      the bundle to retrieve bitstreams from
   * @param options                     options for the find all request
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  findAllByBundle(bundle: Bundle, options?: FindListOptions, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Bitstream>[]): Observable<RemoteData<PaginatedList<Bitstream>>> {
    return this.findListByHref(bundle._links.bitstreams.href, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  /**
   * Retrieve all {@link Bitstream}s in a certain {@link Bundle}.
   *
   * The {@link Item} is technically redundant, but is available
   * in all current use cases, and having it simplifies this method
   *
   * @param item                        the {@link Item} the {@link Bundle} is a part of
   * @param bundleName                  the name of the {@link Bundle} we want to find
   *                                    {@link Bitstream}s for
   * @param options                     the {@link FindListOptions} for the request
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  public findAllByItemAndBundleName(item: Item, bundleName: string, options?: FindListOptions, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Bitstream>[]): Observable<RemoteData<PaginatedList<Bitstream>>> {
    return this.bundleService.findByItemAndName(item, bundleName).pipe(
      switchMap((bundleRD: RemoteData<Bundle>) => {
        if (bundleRD.hasSucceeded && hasValue(bundleRD.payload)) {
          return this.findAllByBundle(bundleRD.payload, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
        } else if (!bundleRD.hasSucceeded && bundleRD.statusCode === 404) {
          return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), []), new Date().getTime());
        } else {
          return [bundleRD as any];
        }
      }),
    );
  }

  /**
   * Set the format of a bitstream
   * @param bitstream
   * @param format
   */
  updateFormat(bitstream: Bitstream, format: BitstreamFormat): Observable<RemoteData<Bitstream>> {
    const requestId = this.requestService.generateRequestId();
    const bitstreamHref$ = this.getBrowseEndpoint().pipe(
      map((href: string) => `${href}/${bitstream.id}`),
      switchMap((href: string) => this.halService.getEndpoint('format', href)),
    );
    const formatHref$ = this.bitstreamFormatService.getBrowseEndpoint().pipe(
      map((href: string) => `${href}/${format.id}`),
    );
    observableCombineLatest([bitstreamHref$, formatHref$]).pipe(
      map(([bitstreamHref, formatHref]) => {
        const options: HttpOptions = Object.create({});
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'text/uri-list');
        options.headers = headers;
        return new PutRequest(requestId, bitstreamHref, formatHref, options);
      }),
      sendRequest(this.requestService),
      take(1),
    ).subscribe(() => {
      this.deleteFormatCache(bitstream);
    });
    return this.rdbService.buildFromRequestUUID(requestId);
  }

  private deleteFormatCache(bitstream: Bitstream) {
    const bitsreamFormatUrl = bitstream.self + '/format';
    this.requestService.setStaleByHrefSubstring(bitsreamFormatUrl);
    // Delete also cache by uuid as the format could be cached also there
    this.objectCache.getByHref(bitsreamFormatUrl).pipe(take(1)).subscribe((cachedRequest) => {
      if (cachedRequest.requestUUIDs && cachedRequest.requestUUIDs.length > 0){
        const requestUuid = cachedRequest.requestUUIDs[0];
        if (this.requestService.hasByUUID(requestUuid)) {
          this.requestService.setStaleByUUID(requestUuid);
        }
      }
    });
  }

  /**
   * Returns an observable of {@link RemoteData} of a {@link Bitstream}, based on a handle and an
   * optional sequenceId or filename, with a list of {@link FollowLinkConfig}, to automatically
   * resolve {@link HALLink}s of the object
   *
   * @param handle                      The handle of the bitstream we want to retrieve
   * @param sequenceId                  The sequence id of the bitstream we want to retrieve
   * @param filename                    The filename of the bitstream we want to retrieve
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  findByItemHandle(
    handle: string,
    sequenceId?: string,
    filename?: string,
    useCachedVersionIfAvailable = true,
    reRequestOnStale = true,
    ...linksToFollow: FollowLinkConfig<Bitstream>[]
  ): Observable<RemoteData<Bitstream>> {
    const searchParams = [];
    searchParams.push(new RequestParam('handle', handle));
    if (hasValue(sequenceId)) {
      searchParams.push(new RequestParam('sequence', sequenceId));
    }
    if (hasValue(filename)) {
      searchParams.push(new RequestParam('filename', filename));
    }

    const hrefObs = this.getSearchByHref(
      'byItemHandle',
      { searchParams },
      ...linksToFollow,
    );

    return this.findByHref(
      hrefObs,
      useCachedVersionIfAvailable,
      reRequestOnStale,
      ...linksToFollow,
    );
  }

  /**
   * Create the HREF for a specific object's search method with given options object
   *
   * @param searchMethod The search method for the object
   * @param options The [[FindListOptions]] object
   * @return {Observable<string>}
   *    Return an observable that emits created HREF
   * @param linksToFollow   List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved
   */
  public getSearchByHref(searchMethod: string, options?: FindListOptions, ...linksToFollow: FollowLinkConfig<Bitstream>[]): Observable<string> {
    return this.searchData.getSearchByHref(searchMethod, options, ...linksToFollow);
  }


  /**
   *
   * Make a request to get primary bitstream
   * in all current use cases, and having it simplifies this method
   *
   * @param item                        the {@link Item} the {@link Bundle} is a part of
   * @param bundleName                  the name of the {@link Bundle} we want to find
   *                                    {@link Bitstream}s for
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param options                     the {@link FindListOptions} for the request
   * @return {Observable<Bitstream | null>}
   *    Return an observable that contains primary bitstream information or null
   */
  public findPrimaryBitstreamByItemAndName(item: Item, bundleName: string, useCachedVersionIfAvailable = true, reRequestOnStale = true, options?: FindListOptions): Observable<Bitstream | null> {
    return this.bundleService.findByItemAndName(item, bundleName, useCachedVersionIfAvailable, reRequestOnStale, options, followLink('primaryBitstream')).pipe(
      getFirstCompletedRemoteData(),
      switchMap((rd: RemoteData<Bundle>) => {
        if (!rd.hasSucceeded) {
          return EMPTY;
        }
        return rd.payload.primaryBitstream.pipe(
          getFirstCompletedRemoteData(),
          map((rdb: RemoteData<Bitstream>) => rdb.hasSucceeded ? rdb.payload : null),
        );
      }),
    );
  }

  /**
   * Make a new FindListRequest with given search method
   *
   * @param searchMethod                The search method for the object
   * @param options                     The [[FindListOptions]] object
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   * @return {Observable<RemoteData<PaginatedList<T>>}
   *    Return an observable that emits response from the server
   */
  public searchBy(searchMethod: string, options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<Bitstream>[]): Observable<RemoteData<PaginatedList<Bitstream>>> {
    return this.searchData.searchBy(searchMethod, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  /**
   * Commit current object changes to the server
   * @param method The RestRequestMethod for which de server sync buffer should be committed
   */
  public commitUpdates(method?: RestRequestMethod): void {
    this.patchData.commitUpdates(method);
  }

  /**
   * Send a patch request for a specified object
   * @param {T} object The object to send a patch request for
   * @param {Operation[]} operations The patch operations to be performed
   */
  public patch(object: Bitstream, operations: []): Observable<RemoteData<Bitstream>> {
    return this.patchData.patch(object, operations);
  }

  /**
   * Add a new patch to the object cache
   * The patch is derived from the differences between the given object and its version in the object cache
   * @param {DSpaceObject} object The given object
   */
  public update(object: Bitstream): Observable<RemoteData<Bitstream>> {
    return this.patchData.update(object);
  }

  /**
   * Return a list of operations representing the difference between an object and its latest value in the cache.
   * @param object  the object to resolve to a list of patch operations
   */
  public createPatchFromCache(object: Bitstream): Observable<Operation[]> {
    return this.patchData.createPatchFromCache(object);
  }

  /**
   * Delete an existing object on the server
   * @param   objectId The id of the object to be removed
   * @param   copyVirtualMetadata (optional parameter) the identifiers of the relationship types for which the virtual
   *                            metadata should be saved as real metadata
   * @return  A RemoteData observable with an empty payload, but still representing the state of the request: statusCode,
   *          errorMessage, timeCompleted, etc
   */
  delete(objectId: string, copyVirtualMetadata?: string[]): Observable<RemoteData<NoContent>> {
    return this.deleteData.delete(objectId, copyVirtualMetadata);
  }

  /**
   * Delete an existing object on the server
   * @param   href The self link of the object to be removed
   * @param   copyVirtualMetadata (optional parameter) the identifiers of the relationship types for which the virtual
   *                            metadata should be saved as real metadata
   * @return  A RemoteData observable with an empty payload, but still representing the state of the request: statusCode,
   *          errorMessage, timeCompleted, etc
   *          Only emits once all request related to the DSO has been invalidated.
   */
  deleteByHref(href: string, copyVirtualMetadata?: string[]): Observable<RemoteData<NoContent>> {
    return this.deleteData.deleteByHref(href, copyVirtualMetadata);
  }

  /**
   * Returns an observable of {@link RemoteData} of a {@link Bitstream}, based on a handle and an
   * optional sequenceId or filename, with a list of {@link FollowLinkConfig}, to automatically
   * resolve {@link HALLink}s of the object
   *
   * @param uuid                        The item UUID to retrieve bitstreams from
   * @param bundlename                  Bundle type of the bitstreams
   * @param metadataFilters             Array of object we want to filter by
   * @param options                     The {@link FindListOptions} for the request
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  findByItem(
    uuid: string,
    bundlename: string,
    metadataFilters: MetadataFilter[],
    options: FindListOptions,
    useCachedVersionIfAvailable = true,
    reRequestOnStale = true,
    ...linksToFollow: FollowLinkConfig<Bitstream>[]
  ): Observable<RemoteData<PaginatedList<Bitstream>>> {
    const searchParams = [];
    searchParams.push(new RequestParam('uuid', uuid));
    searchParams.push(new RequestParam('name', bundlename));

    metadataFilters.forEach((entry: MetadataFilter) => {
      searchParams.push(new RequestParam('filterMetadata', entry.metadataName));
      searchParams.push(new RequestParam('filterMetadataValue', entry.metadataValue));
    });

    const hrefObs = this.getSearchByHref(
      'byItemId',
      { searchParams },
      ...linksToFollow,
    );

    return this.findListByHref(
      hrefObs,
      options,
      useCachedVersionIfAvailable,
      reRequestOnStale,
      ...linksToFollow,
    );
  }

  /**
   * Returns an observable of {@link RemoteData} of a {@link Bitstream} that is not marked
   * hidden (that hasn't got the metadata `bitstream.hide` or its value is not true/yes).
   * resolve {@link HALLink}s of the object
   *
   * @param uuid                        The item UUID to retrieve bitstreams from
   * @param bundlename                  Bundle type of the bitstreams
   * @param metadataFilters             Array of object we want to filter by
   * @param options                     The {@link FindListOptions} for the request
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  findShowableBitstreamsByItem(
    uuid: string,
    bundlename: string,
    metadataFilters: MetadataFilter[],
    options: FindListOptions = {},
    useCachedVersionIfAvailable = true,
    reRequestOnStale = true,
    ...linksToFollow: FollowLinkConfig<Bitstream>[]
  ): Observable<RemoteData<PaginatedList<Bitstream>>> {
    const searchParams = [];
    searchParams.push(new RequestParam('uuid', uuid));
    searchParams.push(new RequestParam('name', bundlename));

    metadataFilters.forEach((entry: MetadataFilter) => {
      searchParams.push(new RequestParam('filterMetadata', entry.metadataName));
      searchParams.push(new RequestParam('filterMetadataValue', entry.metadataValue));
    });

    const hrefObs = this.getSearchByHref(
      'showableByItem',
      { searchParams },
      ...linksToFollow,
    );

    return this.findListByHref(
      hrefObs,
      options,
      useCachedVersionIfAvailable,
      reRequestOnStale,
      ...linksToFollow,
    );
  }

  /**
   * Returns an observable of {@link RemoteData} of a {@link Bitstream} that is not marked
   * hidden (that hasn't got the metadata `bitstream.hide` or its value is not true/yes).
   * resolve {@link HALLink}s of the object
   *
   * @param uuid                        The item UUID to retrieve bitstreams from
   * @param bundlename                  Bundle type of the bitstreams
   * @param metadataFilters             Array of object we want to filter by
   * @param options                     The {@link FindListOptions} for the request
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  showableByItem(
    uuid: string,
    bundlename: string,
    metadataFilters: MetadataFilter[],
    options: FindListOptions,
    useCachedVersionIfAvailable = true,
    reRequestOnStale = true,
    ...linksToFollow: FollowLinkConfig<Bitstream>[]
  ): Observable<RemoteData<PaginatedList<Bitstream>>> {
    const searchParams = [];
    searchParams.push(new RequestParam('uuid', uuid));
    searchParams.push(new RequestParam('name', bundlename));

    metadataFilters.forEach((entry: MetadataFilter) => {
      searchParams.push(new RequestParam('filterMetadata', entry.metadataName));
      searchParams.push(new RequestParam('filterMetadataValue', entry.metadataValue));
    });

    const hrefObs = this.getSearchByHref(
      'showableByItem',
      { searchParams },
      ...linksToFollow,
    );

    return this.findListByHref(
      hrefObs,
      options,
      useCachedVersionIfAvailable,
      reRequestOnStale,
      ...linksToFollow,
    );
  }

  /**
   * Delete multiple {@link Bitstream}s at once by sending a PATCH request to the backend
   *
   * @param bitstreams The bitstreams that should be removed
   */
  removeMultiple(bitstreams: Bitstream[]): Observable<RemoteData<NoContent>> {
    const operations: RemoveOperation[] = bitstreams.map((bitstream: Bitstream) => {
      return {
        op: 'remove',
        path: `/bitstreams/${bitstream.id}`,
      };
    });
    const requestId: string = this.requestService.generateRequestId();

    const hrefObs: Observable<string> = this.halService.getEndpoint(this.linkPath);

    hrefObs.pipe(
      find((href: string) => hasValue(href)),
    ).subscribe((href: string) => {
      const request = new PatchRequest(requestId, href, operations);
      if (hasValue(this.responseMsToLive)) {
        request.responseMsToLive = this.responseMsToLive;
      }
      this.requestService.send(request);
    });

    return this.rdbService.buildFromRequestUUIDAndAwait(requestId, () => observableCombineLatest(bitstreams.map((bitstream: Bitstream) => this.invalidateByHref(bitstream._links.self.href))));
  }

}
