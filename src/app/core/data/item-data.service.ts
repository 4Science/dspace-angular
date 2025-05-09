/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
/* eslint-disable max-classes-per-file */
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Operation } from 'fast-json-patch';
import {
  Observable,
  of,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  find,
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import { validate as uuidValidate } from 'uuid';

import {
  hasValue,
  isNotEmpty,
  isNotEmptyOperator,
} from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { PaginatedSearchOptions } from '../../shared/search/models/paginated-search-options.model';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { BrowseService } from '../browse/browse.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestParam } from '../cache/models/request-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HttpOptions } from '../dspace-rest/dspace-rest.service';
import { Bundle } from '../shared/bundle.model';
import { Collection } from '../shared/collection.model';
import { ExternalSourceEntry } from '../shared/external-source-entry.model';
import { GenericConstructor } from '../shared/generic-constructor';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Item } from '../shared/item.model';
import { MetadataMap } from '../shared/metadata.models';
import { Metric } from '../shared/metric.model';
import { NoContent } from '../shared/NoContent.model';
import { sendRequest } from '../shared/request.operators';
import { URLCombiner } from '../url-combiner/url-combiner';
import {
  CreateData,
  CreateDataImpl,
} from './base/create-data';
import {
  DeleteData,
  DeleteDataImpl,
} from './base/delete-data';
import {
  ConstructIdEndpoint,
  IdentifiableDataService,
} from './base/identifiable-data.service';
import {
  PatchData,
  PatchDataImpl,
} from './base/patch-data';
import { SearchDataImpl } from './base/search-data';
import { BundleDataService } from './bundle-data.service';
import { DSOChangeAnalyzer } from './dso-change-analyzer.service';
import { FindListOptions } from './find-list-options.model';
import { ItemSearchParams } from './item-search-params';
import { PaginatedList } from './paginated-list.model';
import { ResponseParsingService } from './parsing.service';
import { RemoteData } from './remote-data';
import {
  DeleteRequest,
  GetRequest,
  PostRequest,
  PutRequest,
} from './request.models';
import { RequestService } from './request.service';
import { RestRequest } from './rest-request.model';
import { RestRequestMethod } from './rest-request-method';
import { StatusCodeOnlyResponseParsingService } from './status-code-only-response-parsing.service';

/**
 * An abstract service for CRUD operations on Items
 * Doesn't specify an endpoint because multiple endpoints support Item-like functionality (e.g. items, itemtemplates)
 * Extend this class to implement data services for Items
 */
export abstract class BaseItemDataService extends IdentifiableDataService<Item> implements CreateData<Item>, PatchData<Item>, DeleteData<Item> {
  private createData: CreateData<Item>;
  private patchData: PatchData<Item>;
  private deleteData: DeleteData<Item>;
  private searchData: SearchDataImpl<Item>;
  protected searchFindAllByIdPath = 'findAllById';

  protected constructor(
    protected linkPath,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected comparator: DSOChangeAnalyzer<Item>,
    protected browseService: BrowseService,
    protected bundleService: BundleDataService,
    protected constructIdEndpoint: ConstructIdEndpoint = (endpoint, resourceID) => `${endpoint}/${resourceID}`,
  ) {
    super(linkPath, requestService, rdbService, objectCache, halService, undefined, constructIdEndpoint);

    this.createData = new CreateDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive);
    this.patchData = new PatchDataImpl<Item>(this.linkPath, requestService, rdbService, objectCache, halService, comparator, this.responseMsToLive, this.constructIdEndpoint);
    this.deleteData = new DeleteDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive, this.constructIdEndpoint);
    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  /**
   * Get the endpoint for browsing items
   *  (When options.sort.field is empty, the default field to browse by will be 'dc.date.issued')
   * @param {FindListOptions} options
   * @param linkPath
   * @returns {Observable<string>}
   */
  public getBrowseEndpoint(options: FindListOptions = {}, linkPath: string = this.linkPath): Observable<string> {
    let field = 'dc.date.issued';
    if (options.sort && options.sort.field) {
      field = options.sort.field;
    }
    return this.browseService.getBrowseURLFor(field, linkPath).pipe(
      filter((href: string) => isNotEmpty(href)),
      map((href: string) => new URLCombiner(href, `?scope=${options.scopeID}`).toString()),
      distinctUntilChanged(),
    );
  }

  /**
   * Fetches the endpoint used for mapping an item to a collection,
   * or for fetching all collections the item is mapped to if no collection is provided
   * @param itemId        The item's id
   * @param collectionId  The collection's id (optional)
   */
  public getMappedCollectionsEndpoint(itemId: string, collectionId?: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      map((endpoint: string) => this.getIDHref(endpoint, itemId)),
      map((endpoint: string) => `${endpoint}/mappedCollections${collectionId ? `/${collectionId}` : ''}`),
    );
  }

  /**
   * Removes the mapping of an item from a collection
   * @param itemId        The item's id
   * @param collectionId  The collection's id
   */
  public removeMappingFromCollection(itemId: string, collectionId: string): Observable<RemoteData<NoContent>> {
    return this.getMappedCollectionsEndpoint(itemId, collectionId).pipe(
      isNotEmptyOperator(),
      distinctUntilChanged(),
      map((endpointURL: string) => new DeleteRequest(this.requestService.generateRequestId(), endpointURL)),
      sendRequest(this.requestService),
      switchMap((request: RestRequest) => this.rdbService.buildFromRequestUUID(request.uuid)),
    );
  }

  /**
   * Maps an item to a collection
   * @param itemId          The item's id
   * @param collectionHref  The collection's self link
   */
  public mapToCollection(itemId: string, collectionHref: string): Observable<RemoteData<NoContent>> {
    return this.getMappedCollectionsEndpoint(itemId).pipe(
      isNotEmptyOperator(),
      distinctUntilChanged(),
      map((endpointURL: string) => {
        const options: HttpOptions = Object.create({});
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'text/uri-list');
        options.headers = headers;
        const collectionURI = collectionHref.split('?')[0];
        return new PostRequest(this.requestService.generateRequestId(), endpointURL, collectionURI, options);
      }),
      sendRequest(this.requestService),
      switchMap((request: RestRequest) => this.rdbService.buildFromRequestUUID(request.uuid)),
    );
  }

  /**
   * Set the isWithdrawn state of an item to a specified state
   * @param item
   * @param withdrawn
   */
  public setWithDrawn(item: Item, withdrawn: boolean): Observable<RemoteData<Item>> {

    const patchOperation = {
      op: 'replace', path: '/withdrawn', value: withdrawn,
    } as Operation;
    this.requestService.removeByHrefSubstring('/discover');

    return this.patch(item, [patchOperation]);
  }

  /**
   * Set the isDiscoverable state of an item to a specified state
   * @param item
   * @param discoverable
   */
  public setDiscoverable(item: Item, discoverable: boolean): Observable<RemoteData<Item>> {
    const patchOperation = {
      op: 'replace', path: '/discoverable', value: discoverable,
    } as Operation;
    this.requestService.removeByHrefSubstring('/discover');

    return this.patch(item, [patchOperation]);

  }

  /**
   * Get the endpoint for an item's bundles
   * @param itemId
   */
  public getBundlesEndpoint(itemId: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      switchMap((url: string) => this.halService.getEndpoint('bundles', `${url}/${itemId}`)),
    );
  }

  /**
   * Get an item's bundles using paginated search options
   * @param itemId          The item's ID
   * @param searchOptions   The search options to use
   */
  public getBundles(itemId: string, searchOptions?: PaginatedSearchOptions): Observable<RemoteData<PaginatedList<Bundle>>> {
    const hrefObs = this.getBundlesEndpoint(itemId).pipe(
      map((href) => searchOptions ? searchOptions.toRestUrl(href) : href),
    );
    hrefObs.pipe(
      take(1),
    ).subscribe((href) => {
      const request = new GetRequest(this.requestService.generateRequestId(), href);
      this.requestService.send(request);
    });

    return this.rdbService.buildList<Bundle>(hrefObs);
  }

  /**
   * Get the endpoint for an item's metrics
   * @param itemId
   */
  public getMetricsEndpoint(itemId: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      switchMap((url: string) => this.halService.getEndpoint('metrics', `${url}/${itemId}`)),
    );
  }

  /**
   * Get an item's metrics using paginated search options
   * @param itemId          The item's ID
   * @param searchOptions   The search options to use
   */
  public getMetrics(itemId: string, searchOptions?: PaginatedSearchOptions): Observable<RemoteData<PaginatedList<Metric>>> {
    const hrefObs = this.getMetricsEndpoint(itemId).pipe(
      map((href) => searchOptions ? searchOptions.toRestUrl(href) : href),
    );
    hrefObs.pipe(
      take(1),
    ).subscribe((href) => {
      const request = new GetRequest(this.requestService.generateRequestId(), href);
      this.requestService.send(request);
    });

    return this.rdbService.buildList<Metric>(hrefObs);
  }

  /**
   * Create a new bundle on an item
   * @param itemId      The item's ID
   * @param bundleName  The new bundle's name
   * @param metadata    Optional metadata for the bundle
   */
  public createBundle(itemId: string, bundleName: string, metadata?: MetadataMap): Observable<RemoteData<Bundle>> {
    const requestId = this.requestService.generateRequestId();
    const hrefObs = this.getBundlesEndpoint(itemId);

    const bundleJson = {
      name: bundleName,
      metadata: metadata ? metadata : {},
    };

    hrefObs.pipe(
      take(1),
    ).subscribe((href) => {
      const options: HttpOptions = Object.create({});
      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      options.headers = headers;
      const request = new PostRequest(requestId, href, JSON.stringify(bundleJson), options);
      this.requestService.send(request);
    });

    return this.rdbService.buildFromRequestUUID(requestId);
  }

  /**
   * Get the endpoint for an item's identifiers
   * @param itemId
   */
  public getIdentifiersEndpoint(itemId: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      switchMap((url: string) => this.halService.getEndpoint('identifiers', `${url}/${itemId}`)),
    );
  }

  /**
   * Get the endpoint to move the item
   * @param itemId
   */
  public getMoveItemEndpoint(itemId: string, inheritPolicies: boolean): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      map((endpoint: string) => this.getIDHref(endpoint, itemId)),
      map((endpoint: string) => `${endpoint}/owningCollection?inheritPolicies=${inheritPolicies}`),
    );
  }

  /**
   * Move the item to a different owning collection
   * @param itemId
   * @param collection
   */
  public moveToCollection(itemId: string, collection: Collection, inheritPolicies: boolean): Observable<RemoteData<any>> {
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;

    const requestId = this.requestService.generateRequestId();
    const hrefObs = this.getMoveItemEndpoint(itemId, inheritPolicies);

    hrefObs.pipe(
      find((href: string) => hasValue(href)),
      map((href: string) => {
        const request = new PutRequest(requestId, href, collection._links.self.href, options);
        Object.assign(request, {
          // TODO: for now, the move Item endpoint returns a malformed collection -- only look at the status code
          getResponseParser(): GenericConstructor<ResponseParsingService> {
            return StatusCodeOnlyResponseParsingService;
          },
        });
        return request;
      }),
    ).subscribe((request) => {
      this.requestService.send(request);
    });

    return this.rdbService.buildFromRequestUUID(requestId);
  }

  /**
   * Import an external source entry into a collection
   * @param externalSourceEntry
   * @param collectionId
   */
  public importExternalSourceEntry(externalSourceEntry: ExternalSourceEntry, collectionId: string): Observable<RemoteData<Item>> {
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;

    const requestId = this.requestService.generateRequestId();
    const href$ = this.halService.getEndpoint(this.linkPath).pipe(map((href) => `${href}?owningCollection=${collectionId}`));

    href$.pipe(
      find((href: string) => hasValue(href)),
      map((href: string) => {
        const request = new PostRequest(requestId, href, externalSourceEntry._links.self.href, options);
        this.requestService.send(request);
      }),
    ).subscribe();

    return this.rdbService.buildFromRequestUUID(requestId);
  }

  /**
   * Get the endpoint for an item's bitstreams
   * @param itemId
   */
  public getBitstreamsEndpoint(itemId: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      switchMap((url: string) => this.halService.getEndpoint('bitstreams', `${url}/${itemId}`)),
    );
  }

  /**
   * Invalidate the cache of the item
   * @param itemUUID
   */
  invalidateItemCache(itemUUID: string) {
    this.requestService.setStaleByHrefSubstring('item/' + itemUUID);
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
  public patch(object: Item, operations: Operation[]): Observable<RemoteData<Item>> {
    return this.patchData.patch(object, operations);
  }

  /**
   * Add a new patch to the object cache
   * The patch is derived from the differences between the given object and its version in the object cache
   * @param {DSpaceObject} object The given object
   */
  public update(object: Item): Observable<RemoteData<Item>> {
    return this.patchData.update(object);
  }

  /**
   * Return a list of operations representing the difference between an object and its latest value in the cache.
   * @param object  the object to resolve to a list of patch operations
   */
  public createPatchFromCache(object: Item): Observable<Operation[]> {
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
  public delete(objectId: string, copyVirtualMetadata?: string[]): Observable<RemoteData<NoContent>> {
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
  public deleteByHref(href: string, copyVirtualMetadata?: string[]): Observable<RemoteData<NoContent>> {
    return this.deleteData.deleteByHref(href, copyVirtualMetadata);
  }

  /**
   * Create a new object on the server, and store the response in the object cache
   *
   * @param object    The object to create
   * @param params    Array with additional params to combine with query string
   */
  public create(object: Item, ...params: RequestParam[]): Observable<RemoteData<Item>> {
    return this.createData.create(object, ...params);
  }


  /**
   * Search for a list of {@link Item}s using the "findAllById" search endpoint.
   * @param uuidList                    UUID to the objects to search {@link Item}s for. Required.
   * @param options                     {@link FindListOptions} to provide pagination and/or additional arguments
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  findAllById(uuidList: string[], options: FindListOptions = {}, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Item>[]): Observable<RemoteData<PaginatedList<Item>>> {
    return of(new ItemSearchParams(uuidList)).pipe(
      switchMap((params: ItemSearchParams) => {
        return this.searchData.searchBy(this.searchFindAllByIdPath,
          this.createSearchOptionsObjectsFindAllByID(params.uuidList, options), useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
      }),
    );
  }

  /**
   * Create {@link FindListOptions} with {@link RequestParam}s containing a "uuid" list
   * @param uuidList  Required parameter values to add to {@link RequestParam} "id"
   * @param options     Optional initial {@link FindListOptions} to add parameters to
   */
  private createSearchOptionsObjectsFindAllByID(uuidList: string[], options: FindListOptions = {}): FindListOptions {
    let params = [];
    if (isNotEmpty(options.searchParams)) {
      params = [...options.searchParams];
    }
    uuidList.forEach((uuid) => {
      params.push(new RequestParam('id', uuid));
    });
    return Object.assign(new FindListOptions(), options, {
      searchParams: [...params],
    });
  }

  /**
   * Returns an observable of {@link RemoteData} of an object, based on its ID, with a list of
   * {@link FollowLinkConfig}, to automatically resolve {@link HALLink}s of the object
   * @param id                          ID of object we want to retrieve
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  findById(id: string, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Item>[]): Observable<RemoteData<Item>> {

    if (uuidValidate(id)) {
      const href$ = this.getIDHrefObs(encodeURIComponent(id), ...linksToFollow);
      return this.findByHref(href$, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
    } else {
      return this.findByCustomUrl(id, useCachedVersionIfAvailable, reRequestOnStale, linksToFollow);
    }
  }

  /**
   * Returns an observable of {@link RemoteData} of an object, based on its CustomURL or ID, with a list of
   * {@link FollowLinkConfig}, to automatically resolve {@link HALLink}s of the object
   * @param id                          CustomUrl or UUID of object we want to retrieve
   * @param projections                 Array of string of projections to be added to the parameters
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   * @param projections                 List of {@link projections} used to pass as parameters
   */
  findByIdWithProjections(id: string, projections: string[], useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Item>[]): Observable<RemoteData<Item>> {

    if (uuidValidate(id)) {
      return super.findByIdWithProjections(id, projections, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
    } else {
      return this.findByCustomUrl(id, useCachedVersionIfAvailable, reRequestOnStale, linksToFollow, projections);
    }
  }

  /**
   * Returns an observable of {@link RemoteData} of an object, based on its CustomURL or ID, with a list of
   * {@link FollowLinkConfig}, to automatically resolve {@link HALLink}s of the object
   * @param id                          CustomUrl or UUID of object we want to retrieve
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   * @param projections                 List of {@link projections} used to pass as parameters
   */
  private findByCustomUrl(id: string, useCachedVersionIfAvailable = true, reRequestOnStale = true, linksToFollow: FollowLinkConfig<Item>[], projections: string[] = []): Observable<RemoteData<Item>> {
    const searchHref = 'findByCustomURL';

    const options = Object.assign({}, {
      searchParams: [
        new RequestParam('q', id),
      ],
    });

    projections.forEach((projection) => {
      options.searchParams.push(new RequestParam('projection', projection));
    });

    const hrefObs = this.searchData.getSearchByHref(searchHref, options, ...linksToFollow);

    return this.findByHref(hrefObs, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

}

/**
 * A service for CRUD operations on Items
 */
@Injectable({ providedIn: 'root' })
export class ItemDataService extends BaseItemDataService {
  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected comparator: DSOChangeAnalyzer<Item>,
    protected browseService: BrowseService,
    protected bundleService: BundleDataService,
  ) {
    super('items', requestService, rdbService, objectCache, halService, notificationsService, comparator, browseService, bundleService);
  }
}
