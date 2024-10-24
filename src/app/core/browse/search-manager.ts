import { Inject, Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { PaginatedList } from '../data/paginated-list.model';
import { RemoteData } from '../data/remote-data';
import { Item } from '../shared/item.model';
import { getFirstCompletedRemoteData } from '../shared/operators';
import { BrowseEntrySearchOptions } from './browse-entry-search-options.model';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { ItemDataService } from '../data/item-data.service';
import { BrowseService } from './browse.service';
import { environment } from '../../../environments/environment';
import { DSpaceObject } from '../shared/dspace-object.model';
import { PaginatedSearchOptions } from '../../shared/search/models/paginated-search-options.model';
import { SearchObjects } from '../../shared/search/models/search-objects.model';
import { SearchService } from '../shared/search/search.service';
import { hasValue, isNotEmpty } from '../../shared/empty.util';
import { FollowAuthorityMetadata } from '../../../config/search-follow-metadata.interface';
import { MetadataValue } from '../shared/metadata.models';
import { Metadata } from '../shared/metadata.utils';
import isArray from 'lodash/isArray';
import { WORKSPACEITEM } from '../eperson/models/workspaceitem.resource-type';
import { WORKFLOWITEM } from '../eperson/models/workflowitem.resource-type';
import { ITEM } from '../shared/item.resource-type';
import { APP_CONFIG, AppConfig } from "../../../config/app-config.interface";
import { AuthorizationDataService } from "../data/feature-authorization/authorization-data.service";
import { FeatureID } from '../data/feature-authorization/feature-id';
import { Bitstream } from "../shared/bitstream.model";
import { Authorization } from "../shared/authorization.model";
import { SearchOptions } from "../../shared/search/models/search-options.model";

/**
 * The service aims to manage browse requests and subsequent extra fetch requests.
 */
@Injectable({providedIn: 'root'})
export class SearchManager {

  constructor(
    protected itemService: ItemDataService,
    protected browseService: BrowseService,
    protected searchService: SearchService,
    protected authorizationService: AuthorizationDataService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig
  ) {
  }

  /**
   * Get all items linked to a certain metadata value
   * @param filterValue       metadata value to filter by (e.g. author's name)
   * @param filterAuthority   metadata authority to filter
   * @param options           Options to narrow down your search
   * @param linksToFollow     The array of [[FollowLinkConfig]]
   * @returns {Observable<RemoteData<PaginatedList<Item>>>}
   */
  getBrowseItemsFor(filterValue: string, filterAuthority: string, options: BrowseEntrySearchOptions, ...linksToFollow: FollowLinkConfig<any>[]): Observable<RemoteData<PaginatedList<Item>>> {
    return this.browseService.getBrowseItemsFor(filterValue, filterAuthority, options, ...linksToFollow)
      .pipe(this.completeWithExtraData());
  }

  /**
   * Method to retrieve a paginated list of search results from the server
   * @param {PaginatedSearchOptions} searchOptions The configuration necessary to perform this search
   * @param responseMsToLive The amount of milliseconds for the response to live in cache
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   * no valid cached version. Defaults to true
   * @param reRequestOnStale Whether or not the request should automatically be re-requested after
   * the response becomes stale
   * @param linksToFollow List of {@link FollowLinkConfig} that indicate which {@link HALLink}s should be automatically resolved
   * @returns {Observable<RemoteData<SearchObjects<T>>>} Emits a paginated list with all search results found
   */
  search<T extends DSpaceObject>(
    searchOptions?: PaginatedSearchOptions,
    responseMsToLive?: number,
    useCachedVersionIfAvailable = true,
    reRequestOnStale = true,
    ...linksToFollow: FollowLinkConfig<T>[]): Observable<RemoteData<SearchObjects<T>>> {
    return this.searchService.search(searchOptions, responseMsToLive, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow)
      .pipe(this.completeSearchObjectsWithExtraData(searchOptions));
  }


  protected completeWithExtraData() {
    return switchMap((itemsRD: RemoteData<PaginatedList<Item>>) => {
      if (itemsRD.isSuccess) {
        return this.fetchExtraData(itemsRD.payload.page).pipe(map(() => {
          return itemsRD;
        }));
      }
      return of(itemsRD);
    });
  }

  protected completeSearchObjectsWithExtraData<T extends DSpaceObject>(searchOptions: SearchOptions) {
    return switchMap((searchObjectsRD: RemoteData<SearchObjects<T>>) => {
      if (searchObjectsRD.isSuccess) {
        const items: Item[] = searchObjectsRD.payload.page
          .map((searchResult) => isNotEmpty(searchResult?._embedded?.indexableObject) ? searchResult._embedded.indexableObject : searchResult.indexableObject) as any;
        return this.fetchExtraData(items).pipe(
          map(() => {
            return searchObjectsRD;
          }),
          switchMap(() => this.enrichWithThumbnailDownloadAuthorizations(searchObjectsRD)),
          switchMap(() => this.enrichItemsWithCurrentUserAuthorizations(searchObjectsRD, searchOptions.configuration ?? 'default')),
        );
      }
      return of(searchObjectsRD);
    });
  }

  /**
   * Map configured user authorization on each item to avoid multiple request for each item
   *
   * @param searchObjects
   * @param configuration
   * @protected
   */
  protected enrichItemsWithCurrentUserAuthorizations<T extends DSpaceObject>(searchObjects: RemoteData<SearchObjects<T>>, configuration: string): Observable<RemoteData<any>> {
    const objects = searchObjects.payload.page.map((searchResult) => searchResult.indexableObject) as any;
    const mappedEntities = this.getEntityTypeToAuthorizationsMap(objects, configuration);

    if ([...mappedEntities.keys()].length === 0) {
      return of(searchObjects);
    }


    let pageToEnrich = Object.assign([], searchObjects.payload.page);

    const uiidListsMappedToAuthorizations = this.groupItemsUuidsByAuthorizations(objects, mappedEntities);
    const authorizationRequests = [...uiidListsMappedToAuthorizations.keys()].map((features) => {
      const uuidList = uiidListsMappedToAuthorizations.get(features);
      const type = objects.find(object => object.id === uuidList[0]).uniqueType;
      return this.authorizationService.getObjectsAuthorizations(uuidList, type, features);
    });

    return combineLatest(authorizationRequests).pipe(
      map(authorizationsLists => {
        const flatList = [].concat.apply([], authorizationsLists);
        flatList.forEach((authorization: Authorization) => {
          const objectId = this.extractUuidFromAuthorizationId(authorization.id);
          const indexToUpdate = pageToEnrich.indexOf(pageToEnrich.find(object => object.indexableObject.id.toString() === objectId));
          pageToEnrich[indexToUpdate].indexableObject.userAuthorizations = [
            ...pageToEnrich[indexToUpdate].indexableObject.userAuthorizations,
            this.extractFeatureIdFromAuthorizationId(authorization.id)
          ];
        });

        return Object.assign(searchObjects, {
          payload: {
            ...searchObjects.payload,
            page: pageToEnrich
          }
        });
      }),
    );
  }

  /**
   * Group items by authorization ID in a map
   *
   * @param objects
   * @param mappedEntities
   * @private
   */
  private groupItemsUuidsByAuthorizations<T extends DSpaceObject>(objects: T[], mappedEntities: Map<string, FeatureID[]>): Map<FeatureID[], string[]> {
    const mappedUuidListsToFeatures = new Map();
    objects.forEach(object => {
      const objectType = this.getObjectType(object);
      const features = mappedEntities.get(objectType);
      if (hasValue(features) && hasValue(mappedUuidListsToFeatures.get(features))) {
        mappedUuidListsToFeatures.set(features, [...mappedUuidListsToFeatures.get(features), object.id]);
      } else if (hasValue(features)) {
        mappedUuidListsToFeatures.set(features, [object.id]);
      }

    });

    return mappedUuidListsToFeatures;
  }

  /**
   * Return object type to use for configured authorizations
   *
   * @param object
   * @private
   */

  private getObjectType<T extends DSpaceObject>(object: T): string {
    return object.firstMetadataValue('dspace.entity.type') ?? (object as any as Item)?.entityType ?? object?.uniqueType;
  }

  /**
   * Map entity types to required authorizations so that we can group the items by feature
   *
   * @param objects
   * @param configuration
   * @private
   */
  private getEntityTypeToAuthorizationsMap<T extends DSpaceObject>(objects: T[], configuration: string): Map<string, FeatureID[]> {
    const configuredAuthorizationsForDiscovery =
      this.appConfig.discoveryAuthorizationFeaturesConfig[configuration] ?? this.appConfig.discoveryAuthorizationFeaturesConfig.default;
    const mappedEntities = new Map();

    if (!hasValue(configuredAuthorizationsForDiscovery)) {
      return mappedEntities;
    }

    const entityTypes =  [...new Set(objects.map(dso => this.getObjectType(dso)))];
    entityTypes.forEach((entity) => {
      const config = configuredAuthorizationsForDiscovery[entity];
      if (hasValue(config)) {
        mappedEntities.set(entity, config);
      }
    });
    return mappedEntities;
  }

  /**
   * Enrichment method dedicated to thumbnails related to items, to avoid multiple authorizations call on each search.
   * If the thumbnail link has not been resolved this function won't execute any logic.
   *
   * @param searchObjects
   * @protected
   */

  protected enrichWithThumbnailDownloadAuthorizations<T extends DSpaceObject>(searchObjects: RemoteData<SearchObjects<T>>): Observable<RemoteData<any>> {
    const objects = searchObjects.payload.page.map((searchResult) => searchResult.indexableObject) as any;
    const areThumbnailPresent = objects.map(object => object.thumbnail).filter(thumbnail =>  hasValue(thumbnail)).length > 0;

    if (areThumbnailPresent) {
      let enrichedItems = Object.assign([], objects);
      let itemToBitstreamMap = new Map();
      let bitstreamToAuthorizationMap = new Map();
      let allAuthorizations: Authorization[] = [];

      const thumbnails$ = objects
        .map(dso => hasValue((dso as any)?.thumbnail) ? (dso as any)?.thumbnail.pipe(getFirstCompletedRemoteData()) : of(null))
        .map((remoteThumbnail, index) => remoteThumbnail.pipe(
          tap(bitstream  => itemToBitstreamMap.set(objects[index].uuid, (bitstream as RemoteData<Bitstream>)?.payload?.uuid)),
        )) as Observable<RemoteData<Bitstream>>[];

      return combineLatest(...thumbnails$).pipe(
        switchMap(bitstreams => {
          const bitstreamsToAuthorize =  bitstreams.filter(value => hasValue(value?.payload));
          return this.authorizationService.getObjectsAuthorizations(
            bitstreamsToAuthorize.map(bit => bit.payload.uuid),
            bitstreamsToAuthorize[0].payload.uniqueType,
            [FeatureID.CanDownload]
          );
        }),
        tap(allRemoteAuthorizations => allAuthorizations = allRemoteAuthorizations),
        switchMap(authorizations => combineLatest(authorizations
          .map(auth => auth.feature.pipe(
            getFirstCompletedRemoteData(),
            map(data => data?.payload),
            tap(feature => bitstreamToAuthorizationMap.set(this.extractUuidFromAuthorizationId(auth.id), feature))
          ))
        )),
        map(() => {
          const itemsWithNoThumbnail = [...itemToBitstreamMap.keys()].filter(key => !hasValue(itemToBitstreamMap[key]));

          itemsWithNoThumbnail.forEach(uuid => {
            const itemIndexWithNoThumbnail = enrichedItems.indexOf(enrichedItems.find(item => item.uuid === uuid));
            enrichedItems[itemIndexWithNoThumbnail].canDownload = false;
          });

          allAuthorizations.forEach(auth => {
            const bitstreamId = this.extractUuidFromAuthorizationId(auth.id);
            const isCurrentUserAuthorizedToDownloadBitstream = hasValue(bitstreamToAuthorizationMap.get(bitstreamId));
            const mappedItemUuid =  [...itemToBitstreamMap.keys()].find(key => itemToBitstreamMap.get(key) === bitstreamId);
            const itemIndexToEnrich = enrichedItems.indexOf(enrichedItems.find(item => item.uuid === mappedItemUuid));
            enrichedItems[itemIndexToEnrich].canDownload = isCurrentUserAuthorizedToDownloadBitstream;
          });

          const pageToReturn = searchObjects.payload.page.map(item => {
            const enrichedItem = enrichedItems.find(dso => dso.uuid === item.indexableObject.uuid);
            return Object.assign(item, {canDownload: enrichedItem.canDownload});
          });

          return Object.assign(searchObjects, {
            payload: {
              ...searchObjects.payload,
              page: pageToReturn
            }
          });
        })
      );
    } else {
      return of(searchObjects);
    }
  }

  private extractUuidFromAuthorizationId(authId: string): string {
    //we read the bitstream uuid from the authorization id that is composed as follows:
    // epersonUuid_featureID_itemType_itemUuid
    const authSegments = authId.split('_');
    const idSegment = authSegments[authSegments.length - 1];
    // id of workspace or workflow items are made as follows workspace_idNumber
    return idSegment.includes('_') ? idSegment.split('_')[1] : idSegment;
  }

  private extractFeatureIdFromAuthorizationId(authId: string): FeatureID {
    //we read the feature id from the authorization id that is composed as follows:
    // epersonUuid_featureID_itemType_itemUuid
    const authSegments = authId.split('_');
    return authSegments[1] as FeatureID;
  }

  protected fetchExtraData<T extends DSpaceObject>(objects: T[]): Observable<any> {

    const items: Item[] = objects
      .map((object: any) => {
        if (object.type === ITEM.value) {
          return object as Item;
        } else if (object.type === WORKSPACEITEM.value || object.type === WORKFLOWITEM.value) {
          return object?._embedded?.item as Item;
        } else {
          // Handle workflow task here, where the item is embedded in a workflowitem
          return object?._embedded?.workflowitem?._embedded?.item as Item;
        }

      })
      .filter((item) => hasValue(item));

    const uuidList = this.extractUUID(items, environment.followAuthorityMetadata);
    return uuidList.length > 0 ? this.itemService.findAllById(uuidList).pipe(
      getFirstCompletedRemoteData(),
      map(data => {
        if (data.hasSucceeded) {
          return of(data);
        } else {
          of(null);
        }
      })
    ) : of(null);
  }

  protected extractUUID(items: Item[], metadataToFollow: FollowAuthorityMetadata[]): string[] {
    const uuidMap = {};

    items.forEach((item) => {
      metadataToFollow.forEach((followMetadata: FollowAuthorityMetadata) => {
        if (item.entityType === followMetadata.type) {
          if (isArray(followMetadata.metadata)) {
            followMetadata.metadata.forEach((metadata) => {
              Metadata.all(item.metadata, metadata)
                .filter((metadataValue: MetadataValue) => Metadata.hasValidItemAuthority(metadataValue.authority))
                .forEach((metadataValue: MetadataValue) => uuidMap[metadataValue.authority] = metadataValue);
            });
          } else {
            Metadata.all(item.metadata, followMetadata.metadata)
              .filter((metadataValue: MetadataValue) => Metadata.hasValidItemAuthority(metadataValue.authority))
              .forEach((metadataValue: MetadataValue) => uuidMap[metadataValue.authority] = metadataValue);
          }
        }
      });
    });

    return Object.keys(uuidMap);
  }
}
