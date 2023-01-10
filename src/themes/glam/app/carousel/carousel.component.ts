import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {NgbCarousel, NgbSlideEvent, NgbSlideEventSource} from '@ng-bootstrap/ng-bootstrap';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {filter, map, mergeMap, scan, switchMap, take} from 'rxjs/operators';
import {PaginatedList} from '../../../../app/core/data/paginated-list.model';
import {BitstreamFormat} from '../../../../app/core/shared/bitstream-format.model';
import {Bitstream} from '../../../../app/core/shared/bitstream.model';
import {BitstreamDataService} from '../../../../app/core/data/bitstream-data.service';
import {NativeWindowRef, NativeWindowService} from '../../../../app/core/services/window.service';
import {getFirstCompletedRemoteData} from '../../../../app/core/shared/operators';
import {RemoteData} from '../../../../app/core/data/remote-data';
import {Item} from '../../../../app/core/shared/item.model';
import { CarouselOptions } from '../../../../app/shared/carousel/carousel-options.model';
import { hasValue } from '../../../../app/shared/empty.util';
import { ItemSearchResult } from '../../../../app/shared/object-collection/shared/item-search-result.model';
import { followLink } from '../../../../app/shared/utils/follow-link-config.model';

/**
 * Component representing the Carousel component section.
 */
@Component({
  selector: 'ds-carousel-themed',
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
  @ViewChild('carousel', {static: true}) carousel: NgbCarousel;

  isLoading$ = new BehaviorSubject(true);

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
  ) {
  }

  ngOnInit() {
    this.title = this.carouselOptions.title;
    this.link = this.carouselOptions.link;
    this.description = this.carouselOptions.description;

    this.findAllBitstreamImages().subscribe((res) => {
      this.itemToImageHrefMap$.next(res);
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
  }

  /**
   * Find the first image of each item
   */
  findAllBitstreamImages(): Observable<Map<string, string>> {
    return from(this.items).pipe(
      map((itemSR) => itemSR.indexableObject),
      mergeMap((item) => this.bitstreamDataService.findAllByItemAndBundleName(
          item, 'ORIGINAL', {}, true, true, followLink('format'),
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
      scan((acc: Map<string, string>, value: [string, string]) => {
        acc.set(value[0], value[1]);
        return acc;
      }, new Map<string, string>()),
    );
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

}
