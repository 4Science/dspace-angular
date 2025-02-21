import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { hasValue } from '@dspace/shared/utils';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  find,
  map,
} from 'rxjs/operators';

import { RemoteDataBuildService } from '../cache';
import { RequestParam } from '../cache';
import { ObjectCacheService } from '../cache';
import { CoreState } from '../core-state.model';
import {
  DeleteData,
  DeleteDataImpl,
} from '../data';
import { IdentifiableDataService } from '../data';
import {
  SearchData,
  SearchDataImpl,
} from '../data';
import { DSOChangeAnalyzer } from '../data';
import { FindListOptions } from '../data';
import { FollowLinkConfig } from '../data';
import { PaginatedList } from '../data';
import { RemoteData } from '../data';
import { PostRequest } from '../data';
import { RequestService } from '../data';
import { HttpOptions } from '../dspace-rest';
import { NotificationsService } from '../notifications';
import { HALEndpointService } from '../shared';
import { NoContent } from '../shared';
import { WorkspaceItem } from './models';

/**
 * A service that provides methods to make REST requests with workspaceitems endpoint.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceitemDataService extends IdentifiableDataService<WorkspaceItem> implements DeleteData<WorkspaceItem>, SearchData<WorkspaceItem>{
  protected linkPath = 'workspaceitems';
  protected searchByItemLinkPath = 'item';
  private deleteData: DeleteData<WorkspaceItem>;
  private searchData: SearchDataImpl<WorkspaceItem>;

  constructor(
    protected comparator: DSOChangeAnalyzer<WorkspaceItem>,
    protected halService: HALEndpointService,
    protected http: HttpClient,
    protected notificationsService: NotificationsService,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected store: Store<CoreState>) {
    super('workspaceitems', requestService, rdbService, objectCache, halService);
    this.deleteData = new DeleteDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive, this.constructIdEndpoint);
    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }
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
   * Return the WorkspaceItem object found through the UUID of an item
   *
   * @param uuid           The uuid of the item
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param options        The {@link FindListOptions} object
   * @param linksToFollow  List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved
   */
  public findByItem(uuid: string, useCachedVersionIfAvailable = false, reRequestOnStale = true, options: FindListOptions = {}, ...linksToFollow: FollowLinkConfig<WorkspaceItem>[]): Observable<RemoteData<WorkspaceItem>> {
    const findListOptions = new FindListOptions();
    findListOptions.searchParams = [new RequestParam('uuid', uuid)];
    const href$ = this.searchData.getSearchByHref(this.searchByItemLinkPath, findListOptions, ...linksToFollow);
    return this.findByHref(href$, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  /**
   * Import an external source entry into a collection
   * @param externalSourceEntryHref
   * @param collectionId
   */
  public importExternalSourceEntry(externalSourceEntryHref: string, collectionId: string): Observable<RemoteData<WorkspaceItem>> {
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;

    const requestId = this.requestService.generateRequestId();
    const href$ = this.halService.getEndpoint(this.linkPath).pipe(map((href) => `${href}?owningCollection=${collectionId}`));

    href$.pipe(
      find((href: string) => hasValue(href)),
      map((href: string) => {
        const request = new PostRequest(requestId, href, externalSourceEntryHref, options);
        this.requestService.send(request);
      }),
    ).subscribe();

    return this.rdbService.buildFromRequestUUID(requestId);
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
  searchBy(searchMethod: string, options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<WorkspaceItem>[]): Observable<RemoteData<PaginatedList<WorkspaceItem>>> {
    return this.searchData.searchBy(searchMethod, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }
}
