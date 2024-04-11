import { SearchConfig } from './../../../core/shared/search/search-filters/search-config.model';
import { SortDirection } from './../../../core/cache/models/sort-options.model';
import { SEARCH_CONFIG_SERVICE } from './../../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from './../../../core/shared/search/search-configuration.service';
import { SearchManager } from './../../../core/browse/search-manager';
import { NativeWindowRef, NativeWindowService } from './../../../core/services/window.service';
import { BitstreamDataService } from './../../../core/data/bitstream-data.service';
import { Item } from './../../../core/shared/item.model';
import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventDirection } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SliderComponent } from '../../slider/slider.component';
import { CarouselOptions } from '../carousel-options.model';
import { BitstreamImagesService } from './../../../core/data/bitstream-images.service';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';

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
export class CarouselWithThumbnailsComponent extends SliderComponent implements OnInit {

  activeItem: Item;
  activeItemIndex: number;

  @Input() carouselOptions: CarouselOptions;

  @Input() scope: string;

  /**
   * The thumbnails of the items in the carousel
   */
  @ViewChildren('thumbnails') thumbnailList: ElementRef[];

  /**
   * The thumbnail container element (used to scroll to the active thumbnail)
   */
  @ViewChild('thumbnailContainer') thumbnailContainer: ElementRef;

    /**
   * reference to the carousel
   */
  @ViewChild('carousel') carousel: NgbCarousel;


  placeholderSrc = 'assets/images/replacement_image.svg';

  /**
   * Observable that emits a boolean representing if the device is small
   */
  isSmallDevice$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  pageSize = 4;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    protected cdr: ChangeDetectorRef,
    protected searchManager: SearchManager,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    protected breakpointObserver: BreakpointObserver,
    @Inject(SEARCH_CONFIG_SERVICE) private searchConfigService: SearchConfigurationService,
  ) {
    super(bitstreamDataService, bitstreamImagesService, cdr, searchManager, _window, breakpointObserver);
  }

  /**
   * Initialize the component
   * Set the active item to the first item in the list
   * Observe the screen size to determine if the device is small
   */
  ngOnInit() {
    this.searchConfigService.getConfigurationSearchConfig(this.discoveryConfiguration, this.scope).subscribe((searchConfig: SearchConfig) => {
      this.sortField = searchConfig.sortOptions[0]?.name ?? 'lastModified';
      this.sortOrder = searchConfig.sortOptions[0]?.sortOrder ?? SortDirection.DESC;
      this.numberOfItems = this.pageSize;
      this.paginatedSearchOptions = new PaginatedSearchOptions({
        scope: this.scope,
      });
      super.ngOnInit();
    });

    this.initializeEntries();
  }

  initializeEntries() {
    this.title = this.carouselOptions.title;
    this.link = this.carouselOptions.link;
    this.description = this.carouselOptions.description;

    this.activeItemIndex = 0;
    this.activeItem = this.itemList[this.activeItemIndex];
    this.numberOfItems = this.pageSize;
    this.breakpointObserver.observe([
      Breakpoints.XSmall
    ]).subscribe(result => {
      this.isSmallDevice$.next(result.matches);
    });
  }

  /**
   * Determines whether the current page is the first item in the carousel.
   */
  get isFirstItem() {
    return this.activeItemIndex === 0;
  }

  /**
   * Determines whether the current page is the last item in the carousel.
   */
  get isLastItem() {
    return this.activeItemIndex === this.pageInfo.totalElements - 1;
  }

  /**
   * Sets the active item to the item at the given index
   * If the active item is the last item for the current page, the next page is retrieved
   * If the index is out of bounds, the active item is set to the first item
   * @param slideEvent The event emitted when a slide is changed
   */
  onSlide(slideEvent: NgbSlideEvent) {
    this.activeItemIndex = +slideEvent.current.split('ngb-slide-')[1];

    if (slideEvent.direction === NgbSlideEventDirection.LEFT && ((this.activeItemIndex + 1) % this.pageInfo.elementsPerPage === 0)) {
      this.nextPage();
    } else {
      this.setActiveItem(this.activeItemIndex);
    }

    this.activeItem = this.itemList[this.activeItemIndex];
  }

  /**
   * Sets the active item to the item at the given index
   * Scrolls to the active thumbnail
   * @param i The index of the item to set as active
   */
  setActiveItem(i: number) {
    this.carousel.select('ngb-slide-' + i);
    this.carousel.pause();
    this.scrollIntoThumbnails();
  }


  /**
   * Sets the active item to the next item in the carousel
   */
  getNext() {
    this.setActiveItem(this.activeItemIndex + 1);
  }

  /**
   * Emits an event to notify that the previous item in the carousel should be displayed.
   */
  getPrev() {
    this.setActiveItem(this.activeItemIndex - 1);
    this.previousPage();
  }

  /**
   * If the active thumbnail is not in view, the container is scrolled to the active thumbnail
   */
  scrollIntoThumbnails() {
    const thumbnail = this.thumbnailList.find((element, index) => index === this.activeItemIndex);
    if (thumbnail && !this.isElementInView(thumbnail.nativeElement)) {
      this.thumbnailContainer.nativeElement.scrollTop = thumbnail.nativeElement.offsetTop;
    }
  }

  /**
   * Checks if the given thumbnail element is in view
   * @param element the thumbnail element to check if it is in view
   * @returns boolean representing if the element is in view
   */
  private isElementInView(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const containerRect = this.thumbnailContainer.nativeElement.getBoundingClientRect();

    return (
      rect.top >= containerRect.top &&
      rect.bottom <= containerRect.bottom
    );
  }

  isLinkInternal(link: string) {
    return link.startsWith('/');
  }
}
