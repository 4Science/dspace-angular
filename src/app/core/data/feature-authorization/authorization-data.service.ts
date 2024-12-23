import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { Injectable } from '@angular/core';
import { AUTHORIZATION } from '../../shared/authorization.resource-type';
import { Authorization } from '../../shared/authorization.model';
import { RequestService } from '../request.service';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { SiteDataService } from '../site-data.service';
import { followLink, FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';
import { RemoteData } from '../remote-data';
import { PaginatedList } from '../paginated-list.model';
import { catchError, distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators';
import { hasNoValue, hasValue, isNotEmpty } from '../../../shared/empty.util';
import { RequestParam } from '../../cache/models/request-param.model';
import { AuthorizationSearchParams } from './authorization-search-params';
import {
  getAuthorizationFeaturesIDs, getNormalizedUuid,
  oneAuthorizationMatchesFeature
} from './authorization-utils';
import { FeatureID } from './feature-id';
import { getFirstCompletedRemoteData } from '../../shared/operators';
import { FindListOptions } from '../find-list-options.model';
import { BaseDataService } from '../base/base-data.service';
import { SearchData, SearchDataImpl } from '../base/search-data';
import { dataService } from '../base/data-service.decorator';
import { AuthorizationService } from './authorization.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.reducer';
import { DSpaceObject } from '../../shared/dspace-object.model';
import { ObjectAuthorizationsState } from './authorization.interfaces';

/**
 * A service to retrieve {@link Authorization}s from the REST API
 */
@Injectable()
@dataService(AUTHORIZATION)
export class AuthorizationDataService extends BaseDataService<Authorization> implements SearchData<Authorization> {
  protected linkPath = 'authorizations';
  protected searchByObjectPath = 'object';
  protected searchByObjectsPath = 'objects';

  private searchData: SearchDataImpl<Authorization>;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected siteService: SiteDataService,
    protected authorizationService: AuthorizationService,
    protected store: Store<AppState>,
  ) {
    super('authorizations', requestService, rdbService, objectCache, halService);

    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  /**
   * Set all authorization requests to stale
   */
  invalidateAuthorizationsRequestCache() {
    this.requestService.setStaleByHrefSubstring(this.linkPath);
  }

  /**
   * This method invalidates the cache for a given authorization feature and a given item url.
   *
   * @param featureID
   * @param objectUrl
   */
  invalidateAuthorization(featureID?: FeatureID, objectUrl?: string) {
    this.searchData.getSearchByHref(this.searchByObjectPath, this.createSearchOptions(objectUrl, {}, null, featureID))
      .pipe(
        take(1)
      ).subscribe(url => this.requestService.setStaleByHrefSubstring(url));
  }

  /**
   * Checks if an {@link EPerson} (or anonymous) has access to a specific object within a {@link Feature}
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
    return this.authorizationService.hasErrors().pipe(
      take(1),
      switchMap(( hasErrors) => {
        if (!hasErrors && !ePersonUuid) {
          //If no object url is provided than it means is a site authorization.
          //If a person uuid is provided we don't use the state service as it keeps track only of authorizations for the active user.
          const dsoRequest$ = (objectUrl ? this.objectCache.getObjectByHref(objectUrl) : this.siteService.find()) as Observable<DSpaceObject>;

          return combineLatest([dsoRequest$, this.authorizationService.isLoading().pipe(take(1))]).pipe(
            // Get correct item and check that has not already pending authorizations
            switchMap(([object, isPending]) => this.readOrFetchAuthorization(object, featureId, isPending))
          );
        } else {
          // we fallback on old method if site service had initialization issues or if some parameters more than the only feature ID are provided.
          return this.searchByObject(featureId, objectUrl, ePersonUuid, {}, useCachedVersionIfAvailable, reRequestOnStale, followLink('feature')).pipe(
            getFirstCompletedRemoteData(),
            map((authorizationRD) => {
              if (authorizationRD.statusCode !== 401 && hasValue(authorizationRD.payload) && isNotEmpty(authorizationRD.payload.page)) {
                return authorizationRD.payload.page;
              } else {
                return [];
              }
            }),
            catchError(() => observableOf([])),
            oneAuthorizationMatchesFeature(featureId)
          );
        }
      })
    );
  }

  /**
   * Get the authorization from the state, if not present we fetch them for the first time and wait for the state update
   * @param dso
   * @param featureId
   * @param pending
   * @private
   */
  private readOrFetchAuthorization(dso: DSpaceObject, featureId: FeatureID, pending: boolean): Observable<boolean> {
    return this.authorizationService.getAuthorizationForObject(featureId, dso.self).pipe(
      switchMap((authorization) => {
        if (authorization === undefined && !pending) {
          this.authorizationService.initStateForObjects([getNormalizedUuid(dso)], dso.uniqueType, [featureId]);
        }

        return this.authorizationService.isLoading().pipe(
          distinctUntilChanged(),
          filter(loading => !loading),
          switchMap(() => this.authorizationService.getAuthorizationForObject(featureId, dso.self))
        );
      })
    );
  }

  /**
   * Get a map of authorizations for {@link EPerson} (or anonymous)
   * @param uuidList                    Required list of objects' uuids to search {@link Authorization}s for.
   * @param type                        The required DSO UniqueType attribute.
   * @param ePersonUuid                 UUID of the {@link EPerson} to search {@link Authorization}s for.
   *                                    If not provided, the UUID of the currently authenticated {@link EPerson} will be used.
   * @param featuresId                  A list of the IDs of the {@link Feature} to check {@link Authorization} for
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   */
  getAuthorizationForObjects(uuidList: string[], type: string, featuresId?: FeatureID[], ePersonUuid?: string, useCachedVersionIfAvailable = true, reRequestOnStale = true): Observable<ObjectAuthorizationsState> {
    return this.searchObjectsAuthorizations(uuidList,  type, featuresId, ePersonUuid, useCachedVersionIfAvailable, reRequestOnStale).pipe(
      getAuthorizationFeaturesIDs(featuresId)
    );
  }


  /**
   * Return a list of authorizations give a list of uuid and a list of features
   * @param uuidList
   * @param featuresId
   * @param type
   * @param ePersonUuid
   * @param useCachedVersionIfAvailable
   * @param reRequestOnStale
   * @private
   */
  searchObjectsAuthorizations(uuidList: string[], type: string, featuresId?: FeatureID[], ePersonUuid?: string, useCachedVersionIfAvailable = true, reRequestOnStale = true): Observable<Authorization[]> {
    const followLinks = [
      followLink<Authorization>('object'),
      followLink<Authorization>('feature'),
    ];

    return this.searchByObjects(uuidList, type, featuresId, ePersonUuid, {}, useCachedVersionIfAvailable, reRequestOnStale, ...followLinks).pipe(
      getFirstCompletedRemoteData(),
      map((authorizationRD) => {
        if (authorizationRD.statusCode !== 401 && hasValue(authorizationRD.payload) && isNotEmpty(authorizationRD.payload.page)) {
          return authorizationRD.payload.page;
        } else {
          return [];
        }
      }),
      catchError(() => observableOf([]))
    );

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
    const objectUrl$ = observableOf(objectUrl).pipe(
      switchMap((url) => {
        if (hasNoValue(url)) {
          return this.siteService.find().pipe(
            map((site) => site?.self)
          );
        } else {
          return observableOf(url);
        }
      }),
    );

    const out$ = objectUrl$.pipe(
      map((url: string) => new AuthorizationSearchParams(url, ePersonUuid, featureId)),
      switchMap((params: AuthorizationSearchParams) => {
        return this.searchBy(this.searchByObjectPath, this.createSearchOptions(params.objectUrl, options, params.ePersonUuid, params.featureId), useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
      })
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
      ...linksToFollow
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
