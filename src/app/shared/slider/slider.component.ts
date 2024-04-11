import { PageInfo } from './../../core/shared/page-info.model';
import { ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, mergeMap, take, takeUntil } from 'rxjs/operators';

import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { BitstreamImagesService } from '../../core/data/bitstream-images.service';
import { Item } from '../../core/shared/item.model';
import { getItemPageRoute } from '../../item-page/item-page-routing-paths';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { SearchManager } from '../../core/browse/search-manager';
import { SortDirection, SortOptions } from '../../core/cache/models/sort-options.model';
import { PaginationComponentOptions } from '../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { DSpaceObjectType } from '../../core/shared/dspace-object-type.model';
import { RemoteData } from '../../core/data/remote-data';
import { SearchObjects } from '../search/models/search-objects.model';
import { isNotEmpty } from '../empty.util';

/**
 * Component representing the Slider component section.
 */
@Component({
  selector: 'ds-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit, OnDestroy {

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
   * The paginated search options
   */
  @Input() paginatedSearchOptions: PaginatedSearchOptions;

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

  private destroyed = new Subject<void>();

  defaultPaginatedSearchOptions = new PaginatedSearchOptions({
    configuration: this.discoveryConfiguration,
    sort: new SortOptions(this.sortField, SortDirection.DESC),
    dsoTypes: [DSpaceObjectType.ITEM],
    forcedEmbeddedKeys: ['bundles'],
  });

  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  currentScreenSize?: string;
  currentPage = 1;

  pageInfo: PageInfo = new PageInfo({
    elementsPerPage: this.numberOfItems,
    totalElements: 0,
    totalPages: 0,
    currentPage: 1,
  });

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    protected cdr: ChangeDetectorRef,
    protected searchManager: SearchManager,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    @Optional() protected breakpointObserver?: BreakpointObserver,
  ) {
  }

  ngOnInit() {
    this.initLoading$.next(true);
    this.retrieveItems().pipe(
      mergeMap((searchResult: SearchObjects<Item>) => {
        if (isNotEmpty(searchResult)) {
          this.totalPages = searchResult.totalPages;
          this.totalItems = searchResult.totalElements;
          const items: Item[] = searchResult.page.map((searchItem) => searchItem.indexableObject);
          this.itemPlaceholderList = Array(searchResult.totalElements).fill(1).map((x, i) => i + 1);
          this.itemList = [...this.itemList, ...items];
          this.hasMoreToLoad = this.itemList.length < searchResult.totalElements;
          this.initLoading$.next(false);
          this.itemsImagesLoading$.next(true);
          return this.bitstreamImagesService.findAllBitstreamImages(items);
        } else {
          return null;
        }
      }),
      take(1)
    ).subscribe((itemToImageHrefMap: Map<string,string>) => {
      if (isNotEmpty(itemToImageHrefMap)) {
        this.itemToImageHrefMap$.next(new Map([...Array.from(this.itemToImageHrefMap$.value.entries()), ...Array.from(itemToImageHrefMap.entries())]));
        this.cdr.detectChanges();
      }
      this.itemsImagesLoading$.next(false);
    });

    this.breakpointObserver
      ?.observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.currentScreenSize = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });
  }

  get cardsPerPage() { // based on screen size
    const mapping: Record<string, number> = {
      XSmall: 2,
      Small: 3,
      Medium: 4,
      Large: 5,
      XLarge: 6,
    };
    const mappedSize = mapping[this.currentScreenSize ?? 'XSmall'];
    return (mappedSize <= this.numberOfItems) ? mappedSize : this.numberOfItems;
  }

  currentPageItems(): Item[] {
    return this.itemList.slice((this.currentPage - 1) * this.cardsPerPage, this.currentPage * this.cardsPerPage);
  }

  currentLoadingPageItems(): number[] {
    return this.itemPlaceholderList.slice((this.currentPage - 1) * this.cardsPerPage, this.currentPage * this.cardsPerPage);
  }

  getItemLink(item: Item): string {
    if (item) {
      return getItemPageRoute(item);
    }
  }

  pages = () => {
    return Array.from({length: Math.ceil(this.itemPlaceholderList.length / this.cardsPerPage)}, (_, i) => i + 1);
  };

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
    if (this.currentPage < this.pages().length) {
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
          this.hasMoreToLoad = this.itemList.length < searchResult.totalElements;
          return this.bitstreamImagesService.findAllBitstreamImages(items);
        } else {
          return null;
        }
      }),
      take(1)
    ).subscribe((itemToImageHrefMap: Map<string,string>) => {
      if (isNotEmpty(itemToImageHrefMap)) {
        this.itemToImageHrefMap$.next(new Map([...Array.from(this.itemToImageHrefMap$.value.entries()), ...Array.from(itemToImageHrefMap.entries())]));
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
          this.pageInfo = searchResultsRD.payload.pageInfo;
          return searchResultsRD.payload;
        } else {
          return null;
        }
      })
    );
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
