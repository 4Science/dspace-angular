import { SEARCH_CONFIG_SERVICE } from '../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { Item } from '../../core/shared/item.model';
import { ChangeDetectorRef, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { NgbCarousel, NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CarouselOptions } from '../carousel/carousel-options.model';
import { BitstreamImagesService } from '../../core/services/bitstream-images.service';
import { getItemPageRoute } from '../../item-page/item-page-routing-paths';

@Component({
  selector: 'ds-carousel-with-thumbnails',
  templateUrl: './carousel-with-thumbnails.component.html',
  styleUrls: ['./carousel-with-thumbnails.component.scss'],
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ]
})
export class CarouselWithThumbnailsComponent implements OnInit {

  /**
   * The active item in the carousel, used to display the item's metadata
   */
  activeItem: Item;

  /**
   * The index of the active item in the list of items and thumbnails
   */
  activeItemIndex = 0;

  /**
   * The options for the carousel
   */
  @Input() carouselOptions: CarouselOptions;

  /**
   * The configuration for the discovery configuration
   */
  @Input() discoveryConfiguration: string;

  /**
   * The scope for the discovery configuration
   */
  @Input() scope: string;

  /**
   * reference to the carousel
   */
  @ViewChild('carousel') carousel: NgbCarousel;

  /**
   * The source for the placeholder image
   */
  placeholderSrc = 'assets/images/replacement_image.svg';

  /**
   * Observable that emits a boolean representing if the device is small
   */
  isSmallDevice$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * Observable that emits a map of item UUIDs to image hrefs
   */
  itemToImageHrefMap$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

  /**
   * The list of items to display in the carousel
   */
  itemList: Item[] = [];

  /**
   * The number of items to display per page
   */
  pageSize = 4;

  /**
   * The title metadata field
   */
  title: string;

  /**
   * The link
   */
  link: string;

  /**
   * The description metadata field
   */
  description: string;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    protected cdr: ChangeDetectorRef,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    protected breakpointObserver: BreakpointObserver,
  ) {
  }

  /**
   * Initialize the component
   * Set the active item to the first item in the list
   * Observe the screen size to determine if the device is small
   */
  ngOnInit() {
    this.initializeEntries();
  }

  initializeEntries() {
    this.title = this.carouselOptions.title;
    this.link = this.carouselOptions.link;
    this.description = this.carouselOptions.description;

    this.breakpointObserver.observe([
      Breakpoints.XSmall
    ]).subscribe(result => {
      this.isSmallDevice$.next(result.matches);
    });
  }

  /**
   * Sets the active item to the item at the given index.
   */
  onSlide(slideEvent: NgbSlideEvent) {
    this.activeItemIndex = +slideEvent.current.split('ngb-slide-')[1];
    this.activeItem = this.itemList[this.activeItemIndex];
  }

  /**
   * Sets the active item to the item at the given index and pauses the carousel.
   * @param i The index of the item to set as active
   */
  setActiveItem(i: number) {
    this.carousel?.select('ngb-slide-' + i);
    this.carousel?.pause();
  }

  /**
   *  Sets the active item to the item at the given index and changes the active item index.
   * @param index The index of the item to set as active
   */
  activeIndexChange(index: number) {
    this.activeItemIndex = index;
    this.setActiveItem(index);
  }

  /**
   * Check if the link is internal or external
   */
  isLinkInternal(link: string) {
    return link.startsWith('/');
  }

  /**
   * Get the item link
   */
  getItemLink(item: Item): string {
    if (item) {
      return getItemPageRoute(item);
    }
  }

  /**
   * Get the selected item from the thumbnail
   */
  selectedThumbnail(item: Item) {
    this.activeItem = item;
  }

  /**
   * Get the map with the item UUIDs and image hrefs
   */
  getItemMapValue(itemToImageHrefMap: Map<string, string>) {
    this.itemToImageHrefMap$.next(itemToImageHrefMap);
  }

  /**
   * Get the updated item list for all new items that are added to the list.
   */
  getUpdatedItemList(items: Item[]) {
    this.itemList = items;
    this.activeItem = this.itemList[this.activeItemIndex];
  }
}
