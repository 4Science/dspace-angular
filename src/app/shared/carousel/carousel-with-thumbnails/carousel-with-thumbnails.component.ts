import { NativeWindowRef, NativeWindowService } from './../../../core/services/window.service';
import { BitstreamDataService } from './../../../core/data/bitstream-data.service';
import { PageInfo } from './../../../core/shared/page-info.model';
import { Item } from './../../../core/shared/item.model';
import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import { CarouselComponent } from '../carousel.component';
import { NgbSlideEvent, NgbSlideEventDirection } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'ds-carousel-with-thumbnails',
  templateUrl: './carousel-with-thumbnails.component.html',
  styleUrls: ['./carousel-with-thumbnails.component.scss']
})
export class CarouselWithThumbnailsComponent extends CarouselComponent implements OnInit {

  activeItem: Item;
  activeItemIndex: number;

  /**
   * The page information for the current page of items
   */
  @Input() pageInfo: PageInfo;

  /**
   * Emits when the next button is clicked (used to navigate to the next page to retrieve the thumbnails)
   */
  @Output() next = new EventEmitter();

  /**
   * Emits when the previous button is clicked (used to navigate to the previous page to retrieve the thumbnails)
   */
  @Output() prev = new EventEmitter();

  /**
   * The thumbnails of the items in the carousel
   */
  @ViewChildren('thumbnails') thumbnailList: ElementRef[];

  /**
   * The thumbnail container element (used to scroll to the active thumbnail)
   */
  @ViewChild('thumbnailContainer') thumbnailContainer: ElementRef;

  placeholderSrc = 'assets/images/replacement_image.svg';

  /**
   * Observable that emits a boolean representing if the device is small
   */
  isSmallDevice$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    protected breakpointObserver: BreakpointObserver,
    protected bitstreamDataService: BitstreamDataService,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
  ) {
    super(bitstreamDataService, _window);
  }

  /**
   * Initialize the component
   * Set the active item to the first item in the list
   * Observe the screen size to determine if the device is small
   */
  ngOnInit() {
    super.ngOnInit();
    this.activeItemIndex = 0;
    this.activeItem = this.items[this.activeItemIndex];

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
      this.next.emit();
    } else {
      this.setActiveItem(this.activeItemIndex);
    }

    this.activeItem = this.items[this.activeItemIndex];
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
    this.prev.emit();
  }

  /**
   * If the active thumbnail is not in view, the container is scrolled to the active thumbnail
   */
  scrollIntoThumbnails() {
    const a = this.thumbnailList.find((element, index) => index === this.activeItemIndex);
    if (!this.isElementInView(a.nativeElement)) {
      this.thumbnailContainer.nativeElement.scrollTop = a.nativeElement.offsetTop;
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
}
