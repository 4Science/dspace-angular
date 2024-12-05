import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { CarouselOptions } from './carousel-options.model';
import { Item } from '../../core/shared/item.model';
import { BitstreamImagesService } from '../../core/services/bitstream-images.service';
import difference from 'lodash/difference';
import { reduce, take } from 'rxjs/operators';
import { isNotEmpty } from '../empty.util';

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
   * Items to be used in carousel.
   */
  @Input()
  items: ItemSearchResult[];

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

  isLoading$ = new BehaviorSubject(false);


  /**
   * The map of the loaded bitstreams
   */
  pageToBitstreamsMap: Map<number,ItemSearchResult[]> = new Map();


  /**
   * The page number that drives the bitstreams preload
   */
  currentSliderPage = 1;

  private pageSize = 5;

  private slideLoadingBuffer = 2;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
  ) {
  }

  ngOnInit() {
    this.title = this.carouselOptions.title;
    this.link = this.carouselOptions.link;
    this.description = this.carouselOptions.description;
    this.bundle = this.carouselOptions.bundle ?? 'ORIGINAL';
    this.isLoading$.next(true);
    this.findAllBitstreamImages(this.items.filter((_,i) => i < this.pageSize)).subscribe((res) => {
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
    }
  }

  /**
   * Find the first image of each item
   */
  findAllBitstreamImages(items: ItemSearchResult[]): Observable<Map<string, string>> {
    return this.bitstreamImagesService.getItemToImageMap(items.map((itemSR) => itemSR.indexableObject), this.bundle);
  }

  getItemLink(item: Item): string {
    return item.firstMetadataValue(this.link);
  }

  isLinkInternal(link: string) {
    return link.startsWith('/');
  }

  /**
   * to open a link of an item
   */
  openLinkUrl(url) {
    if (url && url[0].value) {
      this._window.nativeWindow.open(url[0].value, '_blank');
    }
  }

  private loadNextPageBitstreams(): void {
    const itemsWithLoadedImages = [].concat((Array.from({length: this.currentSliderPage}, (_, i) => i + 1).map(page => this.pageToBitstreamsMap.get(page))));
    const itemsWithoutBistreamsInNextPage = difference(this.items, itemsWithLoadedImages).filter(item => (this.items.indexOf(item) > itemsWithLoadedImages.length - 1) && this.items.indexOf(item) < (this.currentSliderPage + 1) * this.pageSize);

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
    }));

  }

}
