import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, concatMap, from, Observable } from 'rxjs';
import { filter, map, mergeMap, reduce, switchMap, take } from 'rxjs/operators';
import {PaginatedList} from '../../core/data/paginated-list.model';
import {BitstreamFormat} from '../../core/shared/bitstream-format.model';
import {Bitstream} from '../../core/shared/bitstream.model';
import {BitstreamDataService} from '../../core/data/bitstream-data.service';
import {NativeWindowRef, NativeWindowService} from '../../core/services/window.service';
import {getFirstCompletedRemoteData} from '../../core/shared/operators';
import { hasValue, isNotEmpty } from '../empty.util';
import {ItemSearchResult} from '../object-collection/shared/item-search-result.model';
import {followLink} from '../utils/follow-link-config.model';
import {RemoteData} from '../../core/data/remote-data';
import {CarouselOptions} from './carousel-options.model';
import {Item} from '../../core/shared/item.model';
import { SearchManager } from '../../core/browse/search-manager';
import { SearchObjects } from '../search/models/search-objects.model';
import { SortOptions } from '../../core/cache/models/sort-options.model';
import { PaginationComponentOptions } from '../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { DSpaceObjectType } from '../../core/shared/dspace-object-type.model';
import { InternalLinkService } from '../../core/services/internal-link.service';

/**
 * Component representing the Carousel component section.
 */
@Component({
  selector: 'ds-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: []
})
export class CarouselComponent implements OnInit {

  /**
   * Carousel section configurations.
   */
  @Input()
  carouselOptions: CarouselOptions;

  /**
   * Carousel section title field.
   */
  title: string;

  /**
   * Carousel section bundle field.
   */
  bundle: string;

  /**
   * Carousel section link field.
   */
  link: string;

  /**
   * Carousel section description field.
   */
  description: string;

  /**
   * Auto slider paused
   */
  paused = false;

  /**
   * Auto slider play on click of arrow
   */
  unpauseOnArrow = false;

  /**
   * Auto slider pause on click of Indicator
   */
  pauseOnIndicator = false;

  itemToImageHrefMap$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

  /**
   * reference to the carousel
   */
  @ViewChild('carousel', {static: false}) carousel: NgbCarousel;

  isLoading$ = new BehaviorSubject(true);

  /**
   * The total search item pages
   */
  totalPages = 0;
  /**
   * the total number of item available
   */
  totalItems = 0;

  /**
   * The list of the item to show
   */
  itemList: ItemSearchResult[] = [];

  /**
   * A boolean representing if there are more items to be loaded
   */
  hasMoreToLoad: boolean;
  /**
   * The page number currently visualized
   */
  currentPage = 1;

  itemPlaceholderList: number[];



  constructor(
    protected bitstreamDataService: BitstreamDataService,
    private searchManager: SearchManager,
    public internalLinkService: InternalLinkService,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
  ) {
  }

  ngOnInit() {
    this.title = this.carouselOptions.title;
    this.link = this.carouselOptions.link;
    this.description = this.carouselOptions.description;
    this.bundle = this.carouselOptions.bundle ?? 'ORIGINAL';
    this.retrieveItems().pipe(
      mergeMap((searchResult: SearchObjects<Item>) => {
        if (isNotEmpty(searchResult)) {
          this.totalPages = searchResult.totalPages;
          this.totalItems = searchResult.totalElements;
          this.itemPlaceholderList = Array(searchResult.totalElements).fill(1).map((x, i) => i + 1);
          const items = searchResult.page;
          this.itemList = [...this.itemList, ...items];
          this.hasMoreToLoad = this.itemList.length < searchResult.totalElements;
          this.isLoading$.next(true);
          return this.findAllBitstreamImages(items);
        } else {
          return null;
        }
      }),
      take(1)
    ).subscribe((res) => {
      this.itemToImageHrefMap$.next(res);
      this.isLoading$.next(false);
    });
  }

  /**
   * toggle function to play and pause carousel
   */
  togglePaused() {
    if (this.paused) {
      this.carousel.cycle();
    } else {
      this.carousel.pause();
    }
    this.paused = !this.paused;
  }

  /**
   * function to call on slide
   */
  onSlide(slideEvent: NgbSlideEvent) {
    const previousSlideIndex = parseInt(slideEvent.prev.split(('_'))[1], 10);
    const direction = slideEvent.direction;

    if (this.unpauseOnArrow && slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)) {
      this.togglePaused();
    }
    if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
      this.togglePaused();
    }

    if (previousSlideIndex === (this.carouselOptions.numberOfItems - 1) && direction === 'left' && (this.hasMoreToLoad || this.currentPage < this.totalPages)) {
      this.changePage(this.currentPage + 1);
    } else if (previousSlideIndex === 0 && direction === 'right' && this.currentPage !== 1) {
      this.changePage(this.currentPage - 1);
    } else if (previousSlideIndex === 0 && direction === 'right' && this.currentPage === 1) {
      this.changePage(this.totalPages);
    } else if (previousSlideIndex === (this.currentPageItems().length - 1) && direction === 'left' && (!this.hasMoreToLoad || this.currentPage === this.totalPages)) {
      this.changePage(1);
    }
  }

  /**
   * Find the first image of each item
   */
  findAllBitstreamImages(items: ItemSearchResult[]): Observable<Map<string, string>> {
    return from(items).pipe(
      map((itemSR) => itemSR.indexableObject),
      mergeMap((item) => this.bitstreamDataService.findAllByItemAndBundleName(
          item, this.bundle, {}, true, true, followLink('format'),
        ).pipe(
          getFirstCompletedRemoteData(),
          switchMap((rd: RemoteData<PaginatedList<Bitstream>>) => rd.hasSucceeded ? rd.payload.page : []),
          mergeMap((bitstream: Bitstream) => bitstream.format.pipe(
            getFirstCompletedRemoteData(),
            filter((bitstreamFormatRD: RemoteData<BitstreamFormat>) =>
              bitstreamFormatRD.hasSucceeded && hasValue(bitstreamFormatRD.payload) && hasValue(bitstream) &&
              bitstreamFormatRD.payload.mimetype.includes('image/')
            ),
            map(() => bitstream)
          )),
          take(1),
          map((bitstream: Bitstream) => [item.uuid, bitstream._links.content.href]),
        ),
      ),
      reduce((acc: Map<string, string>, value: [string, string]) => {
        acc.set(value[0], value[1]);
        return acc;
      }, new Map<string, string>()),
    );
  }

  getItemLink(item: Item): string {
    return item.firstMetadataValue(this.link);
  }


  /**
   * to open a link of an item
   */
  openLinkUrl(url) {
    if (url && url[0].value) {
      this._window.nativeWindow.open(url[0].value, '_blank');
    }
  }

  /**
   * Retrieve items by the given page number
   *
   * @param currentPage
   */
  retrieveItems(currentPage: number = 1): Observable<SearchObjects<Item>> {
    const pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
      id: 'sop',
      pageSize: this.carouselOptions.numberOfItems,
      currentPage: currentPage
    });

    const paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: this.carouselOptions.discoveryConfiguration,
      pagination: pagination,
      sort: new SortOptions(this.carouselOptions.sortField, this.carouselOptions.sortDirection),
      dsoTypes: [DSpaceObjectType.ITEM],
      forcedEmbeddedKeys: ['bundles']
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

  currentPageItems(): ItemSearchResult[] {
    return this.itemList.slice((this.currentPage - 1) * this.carouselOptions.numberOfItems, this.currentPage * this.carouselOptions.numberOfItems);
  }

  pages = () => {
    return Array.from({length: Math.ceil(this.itemPlaceholderList.length / this.carouselOptions.numberOfItems)}, (_, i) => i + 1);
  };
  previousPage = () => {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  };

  nextPage = () => {
    if (this.currentPage < this.pages().length) {
      if (this.hasMoreToLoad) {
        this.isLoading$.next(true);
        this.currentPage++;
        this.retrieveMoreItems(this.currentPage);
      } else {
        this.currentPage++;
      }
    }
  };

  changePage = (page) => {
    if (page > this.currentPage && this.hasMoreToLoad) {
      this.isLoading$.next(true);
      const startIndex = this.pages().indexOf(this.currentPage) + 1;
      const endIndex = this.pages().indexOf(page) + 1;
      const pagesToFetch: number[] = this.pages().slice(startIndex, endIndex);
      this.currentPage = page;
      this.retrieveMoreItems(...pagesToFetch);
    } else {
      this.currentPage = page;
    }
  };

  retrieveMoreItems(...page: number[]) {
    from(page).pipe(
      concatMap((currentPage: number) => this.retrieveItems(currentPage).pipe(
        mergeMap((searchResult: SearchObjects<Item>) => {
          if (isNotEmpty(searchResult)) {
            const items = searchResult.page;
            this.itemList = [...this.itemList, ...items];
            this.hasMoreToLoad = this.itemList.length < searchResult.totalElements;
            return this.findAllBitstreamImages(items);
          } else {
            return null;
          }
        }),
        take(1),
        // tap((itemToImageHrefMap) => this.itemToImageHrefMap$.next(new Map([...Array.from(this.itemToImageHrefMap$.value.entries()), ...Array.from(itemToImageHrefMap.entries())]))),
      )),
      reduce((itemToImageHrefMap, value) => {
        return new Map([...Array.from(itemToImageHrefMap.entries()), ...Array.from(value.entries())]);
      }, new Map()),
    ).subscribe((itemToImageHrefMap: Map<string,string>) => {
      if (isNotEmpty(itemToImageHrefMap)) {
        this.itemToImageHrefMap$.next(new Map([...Array.from(this.itemToImageHrefMap$.value.entries()), ...Array.from(itemToImageHrefMap.entries())]));
      }
      this.isLoading$.next(false);
    });
  }

}
