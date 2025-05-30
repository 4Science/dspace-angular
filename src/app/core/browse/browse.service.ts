import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  hasValue,
  hasValueOperator,
  isEmpty,
  isNotEmpty,
} from '../../shared/empty.util';
import {
  followLink,
  FollowLinkConfig,
} from '../../shared/utils/follow-link-config.model';
import { SortDirection } from '../cache/models/sort-options.model';
import { HrefOnlyDataService } from '../data/href-only-data.service';
import { PaginatedList } from '../data/paginated-list.model';
import { RemoteData } from '../data/remote-data';
import { RequestService } from '../data/request.service';
import { BrowseDefinition } from '../shared/browse-definition.model';
import { BrowseEntry } from '../shared/browse-entry.model';
import { FlatBrowseDefinition } from '../shared/flat-browse-definition.model';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Item } from '../shared/item.model';
import {
  getBrowseDefinitionLinks,
  getFirstOccurrence,
  getFirstSucceededRemoteData,
  getPaginatedListPayload,
  getRemoteDataPayload,
} from '../shared/operators';
import { URLCombiner } from '../url-combiner/url-combiner';
import { BrowseDefinitionDataService } from './browse-definition-data.service';
import { BrowseEntrySearchOptions } from './browse-entry-search-options.model';

export function getBrowseLinksToFollow(): FollowLinkConfig<BrowseEntry | Item>[] {
  const followLinks = [
    followLink('thumbnail'),
  ];
  if (environment.item.showAccessStatuses) {
    followLinks.push(followLink('accessStatus'));
  }
  return followLinks;
}

/**
 * The service handling all browse requests
 */
@Injectable({ providedIn: 'root' })
export class BrowseService {
  protected linkPath = 'browses';

  public static toSearchKeyArray(metadataKey: string): string[] {
    const keyParts = metadataKey.split('.');
    const searchFor = [];
    searchFor.push('*');
    for (let i = 0; i < keyParts.length - 1; i++) {
      const prevParts = keyParts.slice(0, i + 1);
      const nextPart = [...prevParts, '*'].join('.');
      searchFor.push(nextPart);
    }
    searchFor.push(metadataKey);
    return searchFor;
  }

  constructor(
    protected requestService: RequestService,
    protected halService: HALEndpointService,
    private browseDefinitionDataService: BrowseDefinitionDataService,
    private hrefOnlyDataService: HrefOnlyDataService,
  ) {
  }

  /**
   * Get all BrowseDefinitions
   */
  getBrowseDefinitions(): Observable<RemoteData<PaginatedList<BrowseDefinition>>> {
    // TODO properly support pagination
    return this.browseDefinitionDataService.findAll({ elementsPerPage: 9999 }).pipe(
      getFirstSucceededRemoteData(),
    );
  }

  /**
   * Get all BrowseEntries filtered or modified by BrowseEntrySearchOptions
   * @param options
   */
  getBrowseEntriesFor(options: BrowseEntrySearchOptions): Observable<RemoteData<PaginatedList<BrowseEntry>>> {
    const href$ = this.getBrowseDefinitions().pipe(
      getBrowseDefinitionLinks(options.metadataDefinition),
      hasValueOperator(),
      map((_links: any) => {
        const entriesLink = _links.entries.href || _links.entries;
        return entriesLink;
      }),
      hasValueOperator(),
      map((href: string) => {
        // TODO nearly identical to PaginatedSearchOptions => refactor
        const args = [];
        if (isNotEmpty(options.scope)) {
          args.push(`scope=${options.scope}`);
        }
        if (isNotEmpty(options.sort)) {
          args.push(`sort=${options.sort.field},${options.sort.direction}`);
        }
        if (isNotEmpty(options.pagination)) {
          args.push(`page=${options.pagination.currentPage - 1}`);
          args.push(`size=${options.pagination.pageSize}`);
        }
        if (isNotEmpty(options.startsWith)) {
          args.push(`startsWith=${options.startsWith}`);
        }
        if (isNotEmpty(args)) {
          href = new URLCombiner(href, `?${args.join('&')}`).toString();
        }
        return href;
      }),
    );
    if (options.fetchThumbnail ) {
      return this.hrefOnlyDataService.findListByHref<BrowseEntry>(href$, {}, undefined, undefined, ...getBrowseLinksToFollow());
    }
    return this.hrefOnlyDataService.findListByHref<BrowseEntry>(href$);
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
    const href$ = this.getBrowseDefinitions().pipe(
      getBrowseDefinitionLinks(options.metadataDefinition),
      hasValueOperator(),
      map((_links: any) => {
        const itemsLink = _links.items.href || _links.items;
        return itemsLink;
      }),
      hasValueOperator(),
      map((href: string) => {
        const args = [];
        if (isNotEmpty(options.scope)) {
          args.push(`scope=${options.scope}`);
        }
        if (isNotEmpty(options.sort)) {
          args.push(`sort=${options.sort.field},${options.sort.direction}`);
        }
        if (isNotEmpty(options.pagination)) {
          args.push(`page=${options.pagination.currentPage - 1}`);
          args.push(`size=${options.pagination.pageSize}`);
        }
        if (isNotEmpty(options.startsWith)) {
          args.push(`startsWith=${options.startsWith}`);
        }
        if (isNotEmpty(filterValue)) {
          args.push(`filterValue=${encodeURIComponent(filterValue)}`);
        }
        if (isNotEmpty(filterAuthority)) {
          args.push(`filterAuthority=${encodeURIComponent(filterAuthority)}`);
        }
        if (isNotEmpty(options.projection)) {
          args.push(`projection=${options.projection}`);
        }
        if (isNotEmpty(args)) {
          href = new URLCombiner(href, `?${args.join('&')}`).toString();
        }
        return href;
      }),
    );
    if (options.fetchThumbnail) {
      return this.hrefOnlyDataService.findListByHref<Item>(href$, {}, true, false, ...getBrowseLinksToFollow());
    }
    return this.hrefOnlyDataService.findListByHref<Item>(href$,{}, true, false, ...linksToFollow);
  }

  /**
   * Get the first item for a metadata definition in an optional scope
   * @param definition
   * @param scope
   * @param sortDirection optional sort parameter
   */
  getFirstItemFor(definition: string, scope?: string, sortDirection?: SortDirection): Observable<RemoteData<Item>> {
    const href$ = this.getBrowseDefinitions().pipe(
      getBrowseDefinitionLinks(definition),
      hasValueOperator(),
      map((_links: any) => {
        const itemsLink = _links.items.href || _links.items;
        return itemsLink;
      }),
      hasValueOperator(),
      map((href: string) => {
        const args = [];
        if (hasValue(scope)) {
          args.push(`scope=${scope}`);
        }
        args.push('page=0');
        args.push('size=1');
        if (sortDirection) {
          args.push('sort=default,' + sortDirection);
        }
        if (isNotEmpty(args)) {
          href = new URLCombiner(href, `?${args.join('&')}`).toString();
        }
        return href;
      }),
    );

    return this.hrefOnlyDataService.findListByHref<Item>(href$).pipe(
      getFirstSucceededRemoteData(),
      getFirstOccurrence(),
    );

  }

  /**
   * Get the previous page of items using the paginated list's prev link
   * @param items
   */
  getPrevBrowseItems(items: RemoteData<PaginatedList<Item>>): Observable<RemoteData<PaginatedList<Item>>> {
    return this.hrefOnlyDataService.findListByHref<Item>(items.payload.prev);
  }

  /**
   * Get the next page of items using the paginated list's next link
   * @param items
   */
  getNextBrowseItems(items: RemoteData<PaginatedList<Item>>): Observable<RemoteData<PaginatedList<Item>>> {
    return this.hrefOnlyDataService.findListByHref<Item>(items.payload.next);
  }

  /**
   * Get the previous page of browse-entries using the paginated list's prev link
   * @param entries
   */
  getPrevBrowseEntries(entries: RemoteData<PaginatedList<BrowseEntry>>): Observable<RemoteData<PaginatedList<BrowseEntry>>> {
    return this.hrefOnlyDataService.findListByHref<BrowseEntry>(entries.payload.prev);
  }

  /**
   * Get the next page of browse-entries using the paginated list's next link
   * @param entries
   */
  getNextBrowseEntries(entries: RemoteData<PaginatedList<BrowseEntry>>): Observable<RemoteData<PaginatedList<BrowseEntry>>> {
    return this.hrefOnlyDataService.findListByHref<BrowseEntry>(entries.payload.next);
  }

  /**
   * Get the browse URL by providing a metadatum key and linkPath
   * @param metadatumKey
   * @param linkPath
   */
  getBrowseURLFor(metadataKey: string, linkPath: string): Observable<string> {
    const searchKeyArray = BrowseService.toSearchKeyArray(metadataKey);
    return this.getBrowseDefinitions().pipe(
      getRemoteDataPayload(),
      getPaginatedListPayload(),
      map((browseDefinitions: BrowseDefinition[]) => browseDefinitions
        .find((def: BrowseDefinition) => {
          let matchingKeys = '';

          if (Array.isArray((def as FlatBrowseDefinition).metadataKeys)) {
            matchingKeys = (def as FlatBrowseDefinition).metadataKeys.find((key: string) => searchKeyArray.indexOf(key) >= 0);
          }

          return isNotEmpty(matchingKeys);
        }),
      ),
      map((def: BrowseDefinition) => {
        if (isEmpty(def) || isEmpty(def._links) || isEmpty(def._links[linkPath])) {
          throw new Error(`A browse endpoint for ${linkPath} on ${metadataKey} isn't configured`);
        } else {
          return def._links[linkPath] || def._links[linkPath].href;
        }
      }),
      startWith(undefined),
      distinctUntilChanged(),
    );
  }

}
