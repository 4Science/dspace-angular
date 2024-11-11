import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { filter, map, mergeMap, reduce, switchMap, take } from 'rxjs/operators';
import {PaginatedList} from '../../core/data/paginated-list.model';
import {BitstreamFormat} from '../../core/shared/bitstream-format.model';
import {Bitstream} from '../../core/shared/bitstream.model';
import {BitstreamDataService} from '../../core/data/bitstream-data.service';
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
import { InternalLinkService } from '../../core/services/internal-link.service';
import difference from 'lodash/difference';

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
   * The map of the loaded bitstreams
   */
  pageToBitstreamsMap: Map<number,ItemSearchResult[]> = new Map();

  /**
   * The page number that drives the bitstreams preload
   */
  currentSliderPage = 1;

  /**
   * Items contained in currently active page
   */
  carouselItems$: BehaviorSubject<ItemSearchResult[]> = new BehaviorSubject<ItemSearchResult[]>([]);

  private paginationOptionId: string;

  private pageSize = 5;

  private slideLoadingBuffer = 2;



  constructor(
    protected bitstreamDataService: BitstreamDataService,
    private searchManager: SearchManager,
    public internalLinkService: InternalLinkService,
  ) {}

  ngOnInit() {
    this.title = this.carouselOptions.title;
    this.link = this.carouselOptions.link;
    this.description = this.carouselOptions.description;
    this.bundle = this.carouselOptions.bundle ?? 'ORIGINAL';
    this.paginationOptionId = 'carousel-search-' + this.carouselOptions.discoveryConfiguration;

    this.retrieveItems().pipe(
      mergeMap((searchResult: SearchObjects<Item>) => {
        if (isNotEmpty(searchResult)) {
          const items = searchResult.page;
          this.carouselItems$.next(items);
          this.isLoading$.next(true);

          return this.findAllBitstreamImages(items.filter((_,i) => i <= this.pageSize - 1));
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
    if (this.unpauseOnArrow && slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)) {
      this.togglePaused();
    }

    if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
      this.togglePaused();
    }

    const currentSlideIndex = parseInt(slideEvent.current.split('-')[2], 10);
    const currentPage = Math.ceil(currentSlideIndex / this.pageSize);

    if (!this.pageToBitstreamsMap.get(currentPage + 1) && currentSlideIndex + this.slideLoadingBuffer === currentPage * this.pageSize) {
      this.loadNextPageBitstreams();
    } else if (slideEvent.source === 'indicator' && currentSlideIndex > this.pageSize * this.currentSliderPage) {
      this.isLoading$.next(true);
      this.currentSliderPage = currentPage;
      this.loadNextPageBitstreams();
    }
  }

  /**
   * Find the first image of each item
   */
  findAllBitstreamImages(items: ItemSearchResult[]): Observable<Map<string, string>> {
    this.pageToBitstreamsMap.set(this.currentSliderPage, items);

    return from(items).pipe(
      map((itemSR) => itemSR.indexableObject),
      mergeMap((item) => this.bitstreamDataService.showableByItem(
          item.uuid, this.bundle, [], {}, true, true, followLink('format'),
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
   * Retrieve items by the given page number
   *
   */
  retrieveItems(): Observable<SearchObjects<Item>> {
    const pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
      id: this.paginationOptionId,
      pageSize: this.carouselOptions.numberOfItems,
      currentPage: 1
    });

    const paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: this.carouselOptions.discoveryConfiguration,
      pagination: pagination,
      sort: new SortOptions(this.carouselOptions.sortField, this.carouselOptions.sortDirection),
      projection: 'preventMetadataSecurity'
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


  pages = () => {
    return Array.from({length: this.carouselOptions.numberOfItems / this.pageSize }, (_, i) => i + 1);
  };


  private loadNextPageBitstreams(): void {
    const items = this.carouselItems$.value;
    const itemsWithLoadedImages = [].concat((Array.from({length: this.currentSliderPage}, (_, i) => i + 1).map(page => this.pageToBitstreamsMap.get(page))));
    const itemsWithoutBistreamsInNextPage = difference(items, itemsWithLoadedImages).filter(item => (items.indexOf(item) > itemsWithLoadedImages.length - 1) && items.indexOf(item) < (this.currentSliderPage + 1) * this.pageSize);

    this.findAllBitstreamImages(itemsWithoutBistreamsInNextPage).pipe(
      take(1),
      reduce((itemToImageHrefMap, value) => {
        return new Map([...Array.from(itemToImageHrefMap.entries()), ...Array.from(value.entries())]);
      }, new Map()),
    ).subscribe(((itemToImageHrefMap: Map<string,string>) => {
      this.currentSliderPage += 1;
      if (isNotEmpty(itemToImageHrefMap)) {
        this.itemToImageHrefMap$.next(new Map([...Array.from(this.itemToImageHrefMap$.value.entries()), ...Array.from(itemToImageHrefMap.entries())]));
      }
      this.isLoading$.next(false);
    }));

  }

}
