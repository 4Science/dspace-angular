import { CollectionElementLinkType } from '../object-collection/collection-element-link.type';
import { LayoutModeEnum, TopSection } from '../../core/layout/models/section.model';
import { Component, inject, Input, OnChanges, OnInit, PLATFORM_ID } from '@angular/core';
import { SearchService } from '../../core/shared/search/search.service';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { SearchResult } from '../search/models/search-result.model';
import { Context } from '../../core/shared/context.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { APP_CONFIG } from '../../../config/app-config.interface';
import { isPlatformServer } from '@angular/common';
import { followLink } from '../utils/follow-link-config.model';
import {
  getAllCompletedRemoteData,
  getPaginatedListPayload,
  getRemoteDataPayload,
  toDSpaceObjectListRD,
} from '../../core/shared/operators';
import { BehaviorSubject, mergeMap, Observable } from 'rxjs';
import { Item } from '../../core/shared/item.model';
import { getItemPageRoute } from '../../item-page/item-page-routing-paths';


@Component({ template: '' })
export abstract class AbstractBrowseElementsComponent implements OnInit, OnChanges {

  protected readonly appConfig = inject(APP_CONFIG);
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly searchService = inject(SearchService);

  protected followThumbnailLink: boolean; // to be overridden

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  /**
   * Optional projection to use during the search
   */
  projection = 'preventMetadataSecurity';

  paginatedSearchOptionsBS: BehaviorSubject<PaginatedSearchOptions>;

  searchResults$: Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>>;

  searchResultArray$: Observable<DSpaceObject[]>;

  // searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  public cardLayoutMode = LayoutModeEnum.CARD;

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

  ngOnChanges() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.paginatedSearchOptionsBS?.next(this.paginatedSearchOptions);
  }

  ngOnInit() {
    const followLinks = this.followThumbnailLink ? [followLink('thumbnail')] : [];

    this.paginatedSearchOptions = Object.assign(new PaginatedSearchOptions({}), this.paginatedSearchOptions, {
      projection: this.projection
    });
    this.paginatedSearchOptionsBS = new BehaviorSubject<PaginatedSearchOptions>(this.paginatedSearchOptions);
    this.searchResults$ = this.paginatedSearchOptionsBS.asObservable().pipe(
      mergeMap((paginatedSearchOptions) =>
        this.searchService.search(paginatedSearchOptions, null, true, true, ...followLinks),
      ),
      getAllCompletedRemoteData(),
    );

    this.searchResultArray$ = this.searchResults$.pipe(
      toDSpaceObjectListRD(),
      getRemoteDataPayload(),
      getPaginatedListPayload(),
    );
  }

  getItemPageRoute(item: DSpaceObject | Item) {
    return getItemPageRoute(item as Item);
  }

}
