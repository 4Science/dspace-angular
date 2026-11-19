import { Injectable } from '@angular/core';
import {
  combineLatest,
  EMPTY,
  Observable,
  of,
  throwError,
} from 'rxjs';
import {
  catchError,
  expand,
  filter,
  map,
  reduce,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import { ObjectAuthorizationsState } from '../../../shared/authorizations/authorization.interfaces';
import {
  hasNoValue,
  hasValue,
  isNotEmpty,
} from '../../../shared/empty.util';
import {
  followLink,
  FollowLinkConfig,
} from '../../../shared/utils/follow-link-config.model';
import { AuthService } from '../../auth/auth.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { RequestParam } from '../../cache/models/request-param.model';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { Authorization } from '../../shared/authorization.model';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { getFirstCompletedRemoteData } from '../../shared/operators';
import { BaseDataService } from '../base/base-data.service';
import {
  SearchData,
  SearchDataImpl,
} from '../base/search-data';
import { FindListOptions } from '../find-list-options.model';
import { PaginatedList } from '../paginated-list.model';
import { RemoteData } from '../remote-data';
import { RequestService } from '../request.service';
import { SiteDataService } from '../site-data.service';
import { AuthorizationSearchParams } from './authorization-search-params';
import {
  authorizationFeatureIds,
  getSucceededPageOrThrow,
  oneAuthorizationMatchesFeature,
} from './authorization-utils';
import { FeatureID } from './feature-id';

/**
 * A service to retrieve {@link Authorization}s from the REST API
 */
@Injectable({ providedIn: 'root' })
export class AuthorizationDataService extends BaseDataService<Authorization> implements SearchData<Authorization> {
  protected linkPath = 'authorizations';
  protected searchByObjectPath = 'object';
  protected searchByObjectsPath = 'objects';

  private searchData: SearchDataImpl<Authorization>;

  /**
   * The IDs of the features granted anonymously on an object, keyed by object URL and
   * re-request setting. A page checks several features on the same object (e.g. two per
   * bitstream on an item page); each entry lets all of those checks share one search and one
   * resolution of the embedded features, instead of repeating that work for every feature.
   */
  private anonymousFeatureIds = new Map<string, { expiresAt: number, featureIds$: Observable<Set<string>> }>();

  /**
   * Grants retrieved with a batched "objects" search (see {@link getAuthorizationForObjects}), keyed by object URL
   */
  private batchedGrants = new Map<string, { expiresAt: number, grants: { [featureId: string]: boolean } }>();

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected siteService: SiteDataService,
    protected authService: AuthService,
  ) {
    super('authorizations', requestService, rdbService, objectCache, halService);

    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  /**
   * Set all authorization requests to stale
   */
  invalidateAuthorizationsRequestCache() {
    this.anonymousFeatureIds.clear();
    this.batchedGrants.clear();
    this.requestService.setStaleByHrefSubstring(this.linkPath);
  }

  /**
   * This method invalidates the cache for a given authorization feature and a given item url.
   *
   * @param featureID
   * @param objectUrl
   */
  invalidateAuthorization(featureID?: FeatureID, objectUrl?: string) {
    if (hasValue(objectUrl)) {
      this.anonymousFeatureIds.forEach((_, key) => key.startsWith(`${objectUrl}|`) && this.anonymousFeatureIds.delete(key));
      this.batchedGrants.delete(objectUrl);
      this.requestService.setStaleByHrefSubstring(objectUrl);
    } else {
      this.anonymousFeatureIds.clear();
      this.batchedGrants.clear();
    }
    this.searchData.getSearchByHref(this.searchByObjectPath, this.createSearchOptions(objectUrl, {}, null, featureID))
      .pipe(
        take(1),
      ).subscribe(url => this.requestService.setStaleByHrefSubstring(url));
  }

  /**
   * Checks if an {@link EPerson} (or anonymous) has access to a specific object within a {@link Feature}
   *
   * @param objectUrl                   URL to the object to search {@link Authorization}s for.
   *                                    If not provided, the repository's {@link Site} will be used.
   * @param ePersonUuid                 UUID of the {@link EPerson} to search {@link Authorization}s for.
   *                                    If not provided, the UUID of the currently authenticated {@link EPerson} will be used.
   * @param featureId                   ID of the {@link Feature} to check {@link Authorization} for
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   */
  isAuthorized(featureId?: FeatureID, objectUrl?: string, ePersonUuid?: string, useCachedVersionIfAvailable = true, reRequestOnStale = true): Observable<boolean> {
    if (hasValue(featureId) && hasNoValue(ePersonUuid)) {
      // An unresolved authentication state must never be mistaken for an anonymous visitor.
      // Without an explicit EPerson the checks are for the current visitor, whether anonymous or
      // authenticated, so they all share one unfiltered search per object.
      return this.authService.isAuthenticationReady().pipe(
        filter((ready: boolean) => ready),
        take(1),
        switchMap(() => this.checkAnonymousAuthorization(featureId, objectUrl, useCachedVersionIfAvailable, reRequestOnStale)),
      );
    }
    return this.checkAuthorization(featureId, objectUrl, ePersonUuid, useCachedVersionIfAvailable, reRequestOnStale);
  }

  /**
   * Feature checks (of the current visitor) on the same object share one unfiltered REST search, and the
   * feature IDs resolved from it (see {@link getAnonymousFeatureIds}).
   * A failed batch (including a custom feature throwing on the backend) falls back to the
   * original individual feature check.
   */
  private checkAnonymousAuthorization(featureId: FeatureID, objectUrl: string, useCachedVersionIfAvailable: boolean, reRequestOnStale: boolean): Observable<boolean> {
    const objectUrl$ = hasValue(objectUrl) ? of(objectUrl) : this.siteService.find().pipe(map((site) => site.self));
    return objectUrl$.pipe(
      take(1),
      // Retrieve the IDs of all features granted on the object, shared with other checks on it
      switchMap((url: string) => this.getBatchedGrant(featureId, url, useCachedVersionIfAvailable) ??
        this.getAnonymousFeatureIds(url, useCachedVersionIfAvailable, reRequestOnStale).pipe(
          // The requested feature is granted if its ID is among them
          map((featureIds: Set<string>) => featureIds.has(featureId.valueOf())),
        )),
      // Any failure along the way: ask the backend about this single feature instead
      catchError(() => this.checkAuthorization(featureId, objectUrl, undefined, useCachedVersionIfAvailable, reRequestOnStale)),
    );
  }

  /**
   * Retrieve the IDs of all features granted anonymously on an object.
   * Concurrent and later calls for the same object reuse the same observable until it expires
   * with the underlying response, so the search and the feature resolution happen only once.
   * The request cache still handles the HTTP request itself (deduplication, SSR transfer state).
   * A failed lookup is removed, so that the next check retries it rather than replaying the error.
   */
  private getAnonymousFeatureIds(url: string, useCachedVersionIfAvailable: boolean, reRequestOnStale: boolean): Observable<Set<string>> {
    const key = `${url}|${reRequestOnStale}`;
    const now = Date.now();
    const cached = this.anonymousFeatureIds.get(key);
    if (useCachedVersionIfAvailable && hasValue(cached) && cached.expiresAt > now) {
      return cached.featureIds$;
    }
    const entry = {
      // BaseDataService may leave responseMsToLive unset; RequestService then uses 15 minutes too
      expiresAt: now + (this.responseMsToLive ?? 15 * 60 * 1000),
      featureIds$: undefined as Observable<Set<string>>,
    };
    entry.featureIds$ = this.findAllAuthorizationsForObject(url, useCachedVersionIfAvailable, reRequestOnStale).pipe(
      // Resolve the embedded feature of each authorization to its ID
      authorizationFeatureIds,
      // Forget a failed lookup, unless it has already been replaced
      catchError((error: unknown) => {
        if (this.anonymousFeatureIds.get(key) === entry) {
          this.anonymousFeatureIds.delete(key);
        }
        return throwError(() => error);
      }),
      // Run the lookup once and replay its result to every check on this object
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.removeExpiredAnonymousFeatureIds(now);
    this.anonymousFeatureIds.set(key, entry);
    return entry.featureIds$;
  }

  /**
   * Remove expired entries, so that browsing many objects does not grow the map indefinitely.
   */
  private removeExpiredAnonymousFeatureIds(now: number): void {
    this.anonymousFeatureIds.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        this.anonymousFeatureIds.delete(key);
      }
    });
  }

  /**
   * Retrieve all {@link Authorization}s granted on an object, following every page before
   * completing, so that a feature is never considered absent because it is on a later page.
   * Errors if any page fails.
   */
  private findAllAuthorizationsForObject(url: string, useCachedVersionIfAvailable: boolean, reRequestOnStale: boolean): Observable<Authorization[]> {
    const firstPage$ = this.searchByObject(undefined, url, undefined, { elementsPerPage: 100 },
      useCachedVersionIfAvailable, reRequestOnStale, followLink('feature'));
    return firstPage$.pipe(
      getSucceededPageOrThrow,
      // Request the next page for as long as the current one links to it
      expand((page: PaginatedList<Authorization>) => {
        if (!page.next) {
          return EMPTY;
        }
        const nextPage$ = this.findListByHref(page.next, {}, useCachedVersionIfAvailable, reRequestOnStale, followLink('feature'));
        this.addDependency(nextPage$, of(url));
        return nextPage$.pipe(getSucceededPageOrThrow);
      }),
      // Combine the authorizations of all pages into one list
      reduce((authorizations: Authorization[], page: PaginatedList<Authorization>) => [...authorizations, ...page.page], []),
    );
  }

  /**
   * Perform the actual authorization lookup for a single feature against the REST API.
   */
  private checkAuthorization(featureId?: FeatureID, objectUrl?: string, ePersonUuid?: string, useCachedVersionIfAvailable = true, reRequestOnStale = true): Observable<boolean> {
    return this.searchByObject(featureId, objectUrl, ePersonUuid, {}, useCachedVersionIfAvailable, reRequestOnStale, followLink('feature')).pipe(
      getFirstCompletedRemoteData(),
      map((authorizationRD) => {
        if (authorizationRD.statusCode !== 401 && hasValue(authorizationRD.payload) && isNotEmpty(authorizationRD.payload.page)) {
          return authorizationRD.payload.page;
        } else {
          return [];
        }
      }),
      catchError(() => of([])),
      oneAuthorizationMatchesFeature(featureId),
    );
  }

  /**
   * The grant of a feature on an object already retrieved by {@link getAuthorizationForObjects}, if any.
   */
  private getBatchedGrant(featureId: FeatureID, objectUrl: string, useCachedVersionIfAvailable: boolean): Observable<boolean> | undefined {
    const batched = this.batchedGrants.get(objectUrl);
    if (useCachedVersionIfAvailable && hasValue(batched) && batched.expiresAt > Date.now() && hasValue(batched.grants[featureId])) {
      return of(batched.grants[featureId]);
    }
    return undefined;
  }

  /**
   * Get a map of authorizations for {@link EPerson} (or anonymous) using a single batched request.
   * When no EPerson is provided, the result is kept so that following {@link isAuthorized} checks on the same
   * objects and features do not need any further request.
   *
   * @param uuidList                    Required list of objects' uuids to search {@link Authorization}s for.
   * @param type                        The required DSO UniqueType attribute.
   * @param featuresId                  A list of the IDs of the {@link Feature} to check {@link Authorization} for
   * @param ePersonUuid                 UUID of the {@link EPerson} to search {@link Authorization}s for.
   *                                    If not provided, the UUID of the currently authenticated {@link EPerson} will be used.
   * @param hrefs                       Self links of the requested objects, all of them are included in the result
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   */
  getAuthorizationForObjects(uuidList: string[], type: string, featuresId?: FeatureID[], ePersonUuid?: string, hrefs?: string[], useCachedVersionIfAvailable: boolean = true, reRequestOnStale: boolean = true): Observable<ObjectAuthorizationsState> {
    return this.searchObjectsAuthorizations(uuidList, type, featuresId, ePersonUuid, useCachedVersionIfAvailable, reRequestOnStale).pipe(
      switchMap((authorizations) => this.toObjectAuthorizationsState(authorizations, featuresId ?? [], hrefs ?? [])),
      tap((state) => {
        if (!hasValue(ePersonUuid)) {
          this.storeBatchedGrants(state);
        }
      }),
    );
  }

  /**
   * Return all the authorizations (following the pagination) for a list of uuids and a list of features
   */
  searchObjectsAuthorizations(uuidList: string[], type: string, featuresId?: FeatureID[], ePersonUuid?: string, useCachedVersionIfAvailable = true, reRequestOnStale = true): Observable<Authorization[]> {
    return this.findAllPages((page) => this.searchByObjects(
      uuidList, type, featuresId, ePersonUuid, { elementsPerPage: 100, currentPage: page },
      useCachedVersionIfAvailable, reRequestOnStale,
      followLink<Authorization>('object'),
      followLink<Authorization>('feature'),
    ));
  }

  /**
   * Retrieve all the pages of a paginated authorizations search.
   * A 401 response is treated as "no authorizations", any other failure results in an error.
   */
  private findAllPages(search: (page: number) => Observable<RemoteData<PaginatedList<Authorization>>>, page = 1, collected: Authorization[] = []): Observable<Authorization[]> {
    return search(page).pipe(
      getFirstCompletedRemoteData(),
      switchMap((rd) => {
        if (rd.hasFailed) {
          return rd.statusCode === 401 ? of(collected) : throwError(() => new Error(`The authorizations search failed with status ${rd.statusCode}`));
        }
        const all = [...collected, ...(rd.payload?.page ?? [])];
        const totalPages = rd.payload?.pageInfo?.totalPages ?? 1;
        return page < totalPages ? this.findAllPages(search, page + 1, all) : of(all);
      }),
    );
  }

  /**
   * Map the authorizations to `{ [objectSelf]: { [featureId]: boolean } }`, every requested href and feature is included
   */
  private toObjectAuthorizationsState(authorizations: Authorization[], featureIDs: FeatureID[], hrefs: string[]): Observable<ObjectAuthorizationsState> {
    const state: ObjectAuthorizationsState = {};
    hrefs.forEach((href) => {
      state[href] = {};
      featureIDs.forEach((id) => state[href][id] = false);
    });

    const withLinks = authorizations.filter((authorization) => hasValue(authorization.object) && hasValue(authorization.feature));
    if (withLinks.length === 0) {
      return of(state);
    }
    return combineLatest(withLinks.map((authorization) => combineLatest([
      authorization.object.pipe(getFirstCompletedRemoteData()),
      authorization.feature.pipe(getFirstCompletedRemoteData()),
    ]))).pipe(
      take(1),
      map((pairs) => {
        pairs.forEach(([objectRD, featureRD]) => {
          if (hasValue(objectRD.payload?.self) && hasValue(featureRD.payload?.id)) {
            state[objectRD.payload.self] = Object.assign({}, state[objectRD.payload.self], { [featureRD.payload.id]: true });
          }
        });
        return state;
      }),
    );
  }

  private storeBatchedGrants(state: ObjectAuthorizationsState) {
    const now = Date.now();
    this.batchedGrants.forEach((entry, key) => entry.expiresAt <= now && this.batchedGrants.delete(key));
    Object.keys(state).forEach((href) => {
      const existing = this.batchedGrants.get(href);
      const current = hasValue(existing) && existing.expiresAt > now ? existing.grants : {};
      this.batchedGrants.set(href, {
        expiresAt: now + (this.responseMsToLive ?? 15 * 60 * 1000),
        grants: Object.assign({}, current, state[href]),
      });
    });
  }

  /**
   * Search for a list of {@link Authorization}s using the "object" search endpoint and providing optional object url,
   * {@link EPerson} uuid and/or {@link Feature} id
   * @param objectUrl                   URL to the object to search {@link Authorization}s for.
   *                                    If not provided, the repository's {@link Site} will be used.
   * @param ePersonUuid                 UUID of the {@link EPerson} to search {@link Authorization}s for.
   *                                    If not provided, the UUID of the currently authenticated {@link EPerson} will be used.
   * @param featureId                   ID of the {@link Feature} to search {@link Authorization}s for
   * @param options                     {@link FindListOptions} to provide pagination and/or additional arguments
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  searchByObject(featureId?: FeatureID, objectUrl?: string, ePersonUuid?: string, options: FindListOptions = {}, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Authorization>[]): Observable<RemoteData<PaginatedList<Authorization>>> {
    const objectUrl$ = of(objectUrl).pipe(
      switchMap((url) => {
        if (hasNoValue(url)) {
          return this.siteService.find().pipe(
            map((site) => site?.self),
          );
        } else {
          return of(url);
        }
      }),
    );

    const out$ = objectUrl$.pipe(
      map((url: string) => new AuthorizationSearchParams(url, ePersonUuid, featureId)),
      switchMap((params: AuthorizationSearchParams) => {
        return this.searchBy(this.searchByObjectPath, this.createSearchOptions(params.objectUrl, options, params.ePersonUuid, params.featureId), useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
      }),
    );

    this.addDependency(out$, objectUrl$);

    return out$;
  }



  /**
   * Search for a list of {@link Authorization}s using the "objects" search endpoint and providing objects uuid,
   * {@link EPerson} uuid and/or {@link Feature} id
   * @param uuidList                    The required list of the Uiid of the items to check for authorization
   * @param type                        The required DSO UniqueType attribute.
   * @param ePersonUuid                 UUID of the {@link EPerson} to search {@link Authorization}s for.
   *                                    If not provided, the UUID of the currently authenticated {@link EPerson} will be used.
   * @param featuresId                   ID of the {@link Feature} to search {@link Authorization}s for
   * @param options                     {@link FindListOptions} to provide pagination and/or additional arguments
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  searchByObjects(uuidList: string[], type: string, featuresId?: FeatureID[], ePersonUuid?: string, options: FindListOptions = {}, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Authorization>[]): Observable<RemoteData<PaginatedList<Authorization>>> {
    return this.searchBy(
      this.searchByObjectsPath,
      this.createSearchOptionsForObjects(uuidList, type, options, ePersonUuid, featuresId),
      useCachedVersionIfAvailable,
      reRequestOnStale,
      ...linksToFollow,
    );
  }

  /**
   * Create {@link FindListOptions} with {@link RequestParam}s containing a "uri", "feature" and/or "eperson" parameter
   * @param objectUrl   Required parameter value to add to {@link RequestParam} "uri"
   * @param options     Optional initial {@link FindListOptions} to add parameters to
   * @param ePersonUuid Optional parameter value to add to {@link RequestParam} "eperson"
   * @param featureId   Optional parameter value to add to {@link RequestParam} "feature"
   */
  private createSearchOptions(objectUrl: string, options: FindListOptions = {}, ePersonUuid?: string, featureId?: FeatureID): FindListOptions {
    let params = [];
    if (isNotEmpty(options.searchParams)) {
      params = [...options.searchParams];
    }
    // TODO fix encode the uri parameter in the self link in the backend and set encodeValue to true afterwards
    params.push(new RequestParam('uri', objectUrl, false));
    if (hasValue(featureId)) {
      params.push(new RequestParam('feature', featureId));
    }
    if (hasValue(ePersonUuid)) {
      params.push(new RequestParam('eperson', ePersonUuid));
    }
    return Object.assign(new FindListOptions(), options, {
      searchParams: [...params],
    });
  }


  /**
   * Create {@link FindListOptions} with {@link RequestParam}s containing a series of "uuid", "features" and/or an "eperson" parameter
   * @param uuidList    Required list to add to {@link RequestParam} "uuid"
   * @param type                        The required DSO UniqueType attribute.
   * @param options     Optional initial {@link FindListOptions} to add parameters to
   * @param ePersonUuid Optional parameter value to add to {@link RequestParam} "eperson"
   * @param featuresId   Optional parameter value to add to {@link RequestParam} "feature"
   */
  private createSearchOptionsForObjects(uuidList: string[], type: string, options: FindListOptions = {}, ePersonUuid?: string, featuresId?: FeatureID[]): FindListOptions {
    let params = [];
    if (isNotEmpty(options.searchParams)) {
      params = [...options.searchParams];
    }

    params.push(new RequestParam('type', type));

    uuidList.forEach(uuid => params.push(new RequestParam('uuid', uuid)));

    if (hasValue(featuresId)) {
      featuresId.forEach(feature => params.push(new RequestParam('feature', feature)));
    }
    if (hasValue(ePersonUuid)) {
      params.push(new RequestParam('eperson', ePersonUuid));
    }
    return Object.assign(new FindListOptions(), options, {
      searchParams: [...params],
    });
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
  searchBy(searchMethod: string, options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<Authorization>[]): Observable<RemoteData<PaginatedList<Authorization>>> {
    return this.searchData.searchBy(searchMethod, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }
}
