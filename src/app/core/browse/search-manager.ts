import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
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
import { APP_CONFIG, AppConfig } from '../../../config/app-config.interface';
import { FeatureID } from '../data/feature-authorization/feature-id';
import { SearchOptions } from '../../shared/search/models/search-options.model';


import { AuthorizationService } from '../data/feature-authorization/authorization.service';

/**
 * The service aims to manage browse requests and subsequent extra fetch requests.
 */
@Injectable({providedIn: 'root'})
export class SearchManager {

  constructor(
    protected itemService: ItemDataService,
    protected browseService: BrowseService,
    protected searchService: SearchService,
    protected authorizationService: AuthorizationService,
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
    const browseOptions = Object.assign({}, options, { projection: options.projection ?? 'preventMetadataSecurity' });
    return this.browseService.getBrowseItemsFor(filterValue, filterAuthority, browseOptions, ...linksToFollow)
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
    const optionsWithDefaultProjection = Object.assign(new PaginatedSearchOptions({}), searchOptions, { projection: searchOptions.projection ?? 'preventMetadataSecurity' });
    return this.searchService.search(optionsWithDefaultProjection, responseMsToLive, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow)
      .pipe(this.completeSearchObjectsWithExtraData(optionsWithDefaultProjection));
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
          switchMap(() => this.fetchConfiguredAuthorizations(searchObjectsRD, searchOptions.configuration ?? 'default')),
          map(() => {
            return searchObjectsRD;
          }),
        );
      }
      return of(searchObjectsRD);
    });
  }

  /**
   * Retrieve configured authorizations related to current discovery configuration
   *
   * @param searchObjects
   * @param configuration
   * @protected
   */
  protected fetchConfiguredAuthorizations<T extends DSpaceObject>(searchObjects: RemoteData<SearchObjects<T>>, configuration: string): Observable<any> {
    const objects = searchObjects.payload.page.map((searchResult) => searchResult.indexableObject) as any;
    const mappedObjects = this.getConfiguredAuthorizationsMap(objects, configuration);

    if ([...mappedObjects.keys()].length === 0) {
      return of(searchObjects);
    }

    const uiidListsMappedToAuthorizations = this.groupItemsUuidsByAuthorizations(objects, mappedObjects);
    [...uiidListsMappedToAuthorizations.keys()].forEach((features) => {
      const uuidList = uiidListsMappedToAuthorizations.get(features);
      const type = objects.find(object => object.id === uuidList[0]).uniqueType;

      this.authorizationService.initStateForObjects(uuidList, type, features);
    });

    return this.authorizationService.isLoading().pipe(
      filter(loading => !loading),
      map(() => {
        return searchObjects;
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
      const objectType = object.uniqueType;
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
   * Map entity types oe unique type to required authorizations so that we can group the items by feature
   *
   * @param objects
   * @param configuration
   * @private
   */
  private getConfiguredAuthorizationsMap<T extends DSpaceObject>(objects: T[], configuration: string): Map<string, FeatureID[]> {
    const configuredAuthorizationsForDiscovery =
      this.appConfig.discoveryAuthorizationFeaturesConfig[configuration] ?? this.appConfig.discoveryAuthorizationFeaturesConfig.default;
    const configuredAuthorizationsToType = new Map();

    if (!hasValue(configuredAuthorizationsForDiscovery)) {
      return configuredAuthorizationsToType;
    }

    const objectUniqueTypes =  [...new Set(objects.map(dso => dso?.uniqueType))];

    objectUniqueTypes.forEach((entity) => {
      const config = configuredAuthorizationsForDiscovery[entity];

      if (hasValue(config)) {
        configuredAuthorizationsToType.set(entity, config);
      }
    });

    return configuredAuthorizationsToType;
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

    const uuidList = this.extractUUID(items, environment.followAuthorityMetadata, environment.followAuthorityMaxItemLimit);

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

  protected extractUUID(items: Item[], metadataToFollow: FollowAuthorityMetadata[], numberOfElementsToReturn?: number): string[] {
    const uuidMap = {};

    items.forEach((item) => {
      metadataToFollow.forEach((followMetadata: FollowAuthorityMetadata) => {
        if (item.entityType === followMetadata.type) {
          if (isArray(followMetadata.metadata)) {
              followMetadata.metadata.forEach((metadata) => {
              Metadata.all(item.metadata, metadata, null, environment.followAuthorityMetadataValuesLimit)
                .filter((metadataValue: MetadataValue) => Metadata.hasValidItemAuthority(metadataValue.authority))
                .forEach((metadataValue: MetadataValue) => uuidMap[metadataValue.authority] = metadataValue);
            });
          } else {
            Metadata.all(item.metadata, followMetadata.metadata, null, environment.followAuthorityMetadataValuesLimit)
              .filter((metadataValue: MetadataValue) => Metadata.hasValidItemAuthority(metadataValue.authority))
              .forEach((metadataValue: MetadataValue) => uuidMap[metadataValue.authority] = metadataValue);
          }
        }
      });
    });

    if (hasValue(numberOfElementsToReturn) && numberOfElementsToReturn > 0) {
      return Object.keys(uuidMap).slice(0, numberOfElementsToReturn);
    }

    return Object.keys(uuidMap);
  }
}
