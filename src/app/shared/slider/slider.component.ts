import { RemoteData } from '../../core/data/remote-data';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { SearchManager } from '../../core/browse/search-manager';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { DSpaceObjectType } from '../../core/shared/dspace-object-type.model';
import { SortDirection, SortOptions } from '../../core/cache/models/sort-options.model';
import { Item } from '../../core/shared/item.model';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, map, mergeMap, Observable, take } from 'rxjs';
import { BitstreamImagesService } from '../../core/services/bitstream-images.service';
import { SearchObjects } from '../search/models/search-objects.model';
import { hasValue, isNotEmpty } from '../empty.util';
import { PaginationComponentOptions } from '../pagination/pagination-component-options.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  template: ''
})
export abstract class SliderComponent implements OnInit {


  /**
   * The bundle to use to look for thumbnails
   */
  @Input() bundle: string;

  /**
   * The discovery configuration to retrieve the items
   */
  @Input() discoveryConfiguration!: string;

  /**
   * The number of item to show for each page
   */
  @Input() numberOfItems = 4;

  /**
   * The sort direction used for the search
   */
  @Input() sortOrder = 'desc';

  /**
   * The sort field used for the search
   */
  @Input() sortField = 'lastModified';

  /**
   * The map between items and images
   */
  @Output() itemToImageHrefMap: EventEmitter<Map<string, string>>  = new EventEmitter<Map<string, string>>();

  /**
   * The list of the item to show
   */
  @Output() itemsUpdated: EventEmitter<Item[]> = new EventEmitter<Item[]>();

  /**
   * The paginated search options
   */
  paginatedSearchOptions: PaginatedSearchOptions;

  /**
   * A boolean representing if there are more items to be loaded
   */
  hasMoreToLoad: boolean;

  /**
   * The list of the item to show
   */
  itemList: Item[] = [];

  /**
   * The list of number which length is the total number of items available
   */
  itemPlaceholderList: number[] = [];

  /**
   * The total search item pages
   */
  totalPages = 0;

  /**
   * the total number of item available
   */
  totalItems = 0;

  /**
   * Slider section title field.
   */
  title = 'dc.title';

  /**
   * Slider section link field.
   */
  link = 'cris.news.url';

  /**
   * Slider section description field.
   */
  description: string;

  /**
   * The map between items and images
   */
  itemToImageHrefMap$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

  /**
   * A boolean representing is first request to retrieve items is pending
   */
  initLoading$ = new BehaviorSubject(true);

  /**
   * A boolean representing is a request to retrieve items bitstream is pending
   */
  itemsImagesLoading$ = new BehaviorSubject(true);

  /**
   * The default paginated search options
   */
  defaultPaginatedSearchOptions = new PaginatedSearchOptions({
    configuration: this.discoveryConfiguration,
    sort: new SortOptions(this.sortField, SortDirection.DESC),
    dsoTypes: [DSpaceObjectType.ITEM],
    forcedEmbeddedKeys: ['bundles'],
  });

  currentPage = 1;

  readonly placeholderSrc = 'assets/images/replacement_image.svg';

  isBrowser: boolean;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    protected cdr: ChangeDetectorRef,
    protected searchManager: SearchManager,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    @Inject(PLATFORM_ID) protected platformId: string,
  ) {
  }

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initLoading$.next(true);
    this.retrieveItems().pipe(
      mergeMap((searchResult: SearchObjects<Item>) => {
        if (isNotEmpty(searchResult)) {
          this.totalPages = searchResult.totalPages;
          this.totalItems = searchResult.totalElements;
          const items: Item[] = searchResult.page.map((searchItem) => searchItem.indexableObject);
          this.itemPlaceholderList = Array(searchResult.totalElements).fill(1).map((x, i) => i + 1);
          this.itemList = [...this.itemList, ...items];
          this.itemsUpdated.emit(this.itemList);
          this.hasMoreToLoad = this.itemList.length < searchResult.totalElements;
          this.initLoading$.next(false);
          this.itemsImagesLoading$.next(true);
          return hasValue(this.bundle)
            ? this.bitstreamImagesService.getItemToImageMap(items, this.bundle)
            : this.bitstreamImagesService.getItemToImageMap(items);
        } else {
          return null;
        }
      }),
      take(1)
    ).subscribe((itemToImageHrefMap: Map<string,string>) => {
      if (isNotEmpty(itemToImageHrefMap)) {
        this.itemToImageHrefMap$.next(new Map([...Array.from(this.itemToImageHrefMap$.value.entries()), ...Array.from(itemToImageHrefMap.entries())]));
        this.itemToImageHrefMap.emit(this.itemToImageHrefMap$.getValue());
        this.cdr.detectChanges();
      }
      this.itemsImagesLoading$.next(false);
    });
  }

  previousPage = () => {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  };

  changePage = (page) => {
    if (page > this.currentPage && this.hasMoreToLoad) {
      this.itemsImagesLoading$.next(true);
      this.currentPage = page;
      this.retrieveMoreItems(this.currentPage);
    } else {
      this.currentPage = page;
    }
  };

  nextPage = () => {
    if (this.currentPage < this.totalPages) {
      if (this.hasMoreToLoad) {
        this.itemsImagesLoading$.next(true);
        this.currentPage++;
        this.retrieveMoreItems(this.currentPage);

      } else {
        this.currentPage++;
      }
    }
  };

  retrieveMoreItems(currentPage) {
    this.retrieveItems(currentPage).pipe(
      mergeMap((searchResult: SearchObjects<Item>) => {
        if (isNotEmpty(searchResult)) {
          const items: Item[] = searchResult.page.map((searchItem) => searchItem.indexableObject);
          this.itemList = [...this.itemList, ...items];
          this.itemsUpdated.emit(this.itemList);
          this.hasMoreToLoad = this.itemList.length < searchResult.totalElements;
          return this.bitstreamImagesService.getItemToImageMap(items);
        } else {
          return null;
        }
      }),
      take(1)
    ).subscribe((itemToImageHrefMap: Map<string,string>) => {
      if (isNotEmpty(itemToImageHrefMap)) {
        this.itemToImageHrefMap$.next(new Map([...Array.from(this.itemToImageHrefMap$.value.entries()), ...Array.from(itemToImageHrefMap.entries())]));
        this.itemToImageHrefMap.emit(this.itemToImageHrefMap$.getValue());
        this.cdr.detectChanges();
      }
      this.itemsImagesLoading$.next(false);
    });
  }

  /**
   * Retrieve items by the given page number
   *
   * @param currentPage
   */
  retrieveItems(currentPage: number = 1): Observable<SearchObjects<Item>> {
    const pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
      id: 'sop',
      pageSize: this.numberOfItems,
      currentPage: currentPage
    });
    const sortDirection = this.sortOrder?.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    const searchOptions = this.paginatedSearchOptions ?? this.defaultPaginatedSearchOptions;
    const paginatedSearchOptions = new PaginatedSearchOptions({
      ...searchOptions,
      sort: new SortOptions(this.sortField, sortDirection),
      pagination: pagination,
      configuration: this.discoveryConfiguration,
    });

    return this.searchManager.search(paginatedSearchOptions).pipe(
      getFirstCompletedRemoteData(),
      map((searchResultsRD: RemoteData<SearchObjects<Item>>) => {
        if (searchResultsRD.hasSucceeded) {
          return searchResultsRD.payload;
        } else {
          return null;
        }
      })
    );
  }
}
