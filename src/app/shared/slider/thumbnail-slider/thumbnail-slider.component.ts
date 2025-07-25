import {
  AsyncPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { SearchManager } from '../../../core/browse/search-manager';
import { SortDirection } from '../../../core/cache/models/sort-options.model';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { BitstreamImagesService } from '../../../core/services/bitstream-images.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../../../core/services/window.service';
import { Item } from '../../../core/shared/item.model';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { SearchConfig } from '../../../core/shared/search/search-filters/search-config.model';
import { SEARCH_CONFIG_SERVICE } from '../../../my-dspace-page/my-dspace-configuration.service';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import { BackgroundImageDirective } from '../../utils/background-image.directive';
import { SliderComponent } from '../slider.component';

@Component({
  selector: 'ds-thumbnail-slider',
  templateUrl: './thumbnail-slider.component.html',
  styleUrls: ['./thumbnail-slider.component.scss'],
  standalone: true,
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService,
    },
  ],
  imports: [
    NgClass,
    BackgroundImageDirective,
    NgxSkeletonLoaderModule,
    AsyncPipe,
    NgIf,
    NgStyle,
    NgTemplateOutlet,
    NgForOf,
  ],
})
export class ThumbnailSliderComponent extends SliderComponent implements OnInit, OnChanges {

  /**
   *The index of the active thumbnail
   */
  activeIndex = 0;

  /**
   * The scope for the discovery configuration (item UUID)
   */
  @Input() scope: string;

  /**
   * The new active item index from an outer indicator
   * (e.g. a carousel with thumbnails that has an active item index that should be synchronized with this thumbnail slider)
   */
  @Input() activeItemIndexInOuterIndicator: number;

  /**
   * Event emitted when a thumbnail is selected
   */
  @Output() thumbnailSelected: EventEmitter<Item> = new EventEmitter<Item>();

  /**
   * Event emitted when the active index changes
   * (used to synchronize the active index with an outer indicator)
   */
  @Output() activeIndexChange: EventEmitter<number> = new EventEmitter<number>();

  /**
   * The height of the thumbnail, defined as number
   * (used to calculate the height of the thumbnail container in px)
   */
  @Input() heightThumbnailPx: number;

  /**
   * The width of the thumbnail, defined as number
   * (used to calculate the width of the thumbnail container in px)
   */
  @Input() widthThumbnailPx: number;

  /**
   * Flag to determine if the thumbnails should be displayed horizontally
   */
  @Input() isHorizontal = false;

  /**
   * The SliderEventSource that is triggered from the outer indicator (carousel-with-thumbnails)
   */
  @Input() sliderEventSource?: NgbSlideEvent;

  /**
   * The thumbnail container element (used to scroll to the active thumbnail)
   */
  @ViewChild('thumbnailContainer') thumbnailContainer: ElementRef;

  /**
   * The thumbnails of the items in the carousel
   */
  @ViewChildren('thumbnails') thumbnailList: ElementRef[];

  /**
   * Flag to indicate the direction of the horizontal scroll
   */
  private direction: 'arrowRight' | 'arrowLeft';

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    protected cdr: ChangeDetectorRef,
    protected searchManager: SearchManager,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    @Inject(SEARCH_CONFIG_SERVICE) private searchConfigService: SearchConfigurationService,
    @Inject(PLATFORM_ID) protected platformId: string,
  ) {
    super(bitstreamDataService, bitstreamImagesService, cdr, searchManager, _window, platformId);
  }

  /**
   * Determine the sort field and order for the search configuration
   * Initialize the paginated search options
   */
  ngOnInit() {
    this.searchConfigService.getConfigurationSearchConfig(this.discoveryConfiguration, this.scope).subscribe((searchConfig: SearchConfig) => {
      this.sortField = searchConfig.sortOptions[0]?.name ?? 'lastModified';
      this.sortOrder = searchConfig.sortOptions[0]?.sortOrder ?? SortDirection.DESC;
      this.paginatedSearchOptions = new PaginatedSearchOptions({
        scope: this.scope,
      });
      super.ngOnInit();
    });
  }

  /**
   * If the active item index in the outer indicator changes, the active index is set to the new value.
   * Checks if the next page should be retrieved
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.activeItemIndexInOuterIndicator) {
      if (changes?.sliderEventSource && changes.sliderEventSource.currentValue?.source) {
        this.direction = changes.sliderEventSource.currentValue.source;
      }

      this.setActiveIndex(changes.activeItemIndexInOuterIndicator.currentValue);
      this.checkAndGetNextPage();
    }

    if (
      changes?.numberOfItems &&
      changes.numberOfItems.currentValue !== changes.numberOfItems.previousValue &&
      !changes.numberOfItems.isFirstChange
    ) {
      this.retrieveItems();
    }
  }

  /**
   * Determines whether the current page is the first item in the carousel.
   */
  get isFirstItem() {
    return this.activeIndex === 0;
  }

  /**
   * Determines whether the current page is the last item in the carousel.
   */
  get isLastItem() {
    return this.activeIndex === this.totalItems - 1;
  }

  /**
   * Emits the item that is clicked and sets the active index to the index of the clicked item
   * @param item The item that is clicked
   * @param index The index of the item in the list
   */
  onThumbnailClick(item: Item, index: number) {
    this.setActiveIndex(index);
    this.thumbnailSelected.emit(item);
  }

  /**
   * If the active thumbnail is not in view, the container is scrolled to the active thumbnail
   * (horizontal or vertical depending on the isHorizontal flag)
   */
  scrollIntoThumbnails() {
    const thumbnail = this.thumbnailList?.find((element, index) => index === this.activeIndex);
    if (thumbnail && !this.isElementInView(thumbnail.nativeElement)) {
      if (this.isHorizontal) {
        if (this.activeIndex === 0) {
          this.thumbnailContainer.nativeElement.scrollLeft = 0;
        } else if (this.activeIndex === this.itemList.length - 1) {
          this.thumbnailContainer.nativeElement.scrollLeft = this.thumbnailContainer.nativeElement.scrollWidth;
        } else if (this.direction === 'arrowRight') {
          this.thumbnailContainer.nativeElement.scrollLeft += thumbnail.nativeElement.offsetWidth;
        } else if (this.direction === 'arrowLeft') {
          this.thumbnailContainer.nativeElement.scrollLeft -= thumbnail.nativeElement.offsetWidth;
        }
      } else {
        this.thumbnailContainer.nativeElement.scrollTop = thumbnail.nativeElement.offsetTop;
      }
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

    const isInVerticalView = rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
    const isInHorizontalView = rect.left >= containerRect.left && rect.right <= containerRect.right;

    return this.isHorizontal ? isInHorizontalView : isInVerticalView;
  }

  /**
   * Sets the active index to the next index and checks if the next page should be retrieved
   */
  getNext() {
    this.direction = 'arrowRight';
    const index = this.activeIndex + 1;
    this.setActiveIndex(index);
    this.checkAndGetNextPage();
  }

  /**
   * Sets the active index to the previous index and checks if the previous page should be retrieved
   */
  getPrev() {
    this.direction = 'arrowLeft';
    const index = this.activeIndex - 1;
    this.setActiveIndex(index);
    this.previousPage();
  }

  /**
   * Checks if the next page should be retrieved and scrolls to the active thumbnail
   * @param index The index to set as active
   */
  private checkAndGetNextPage() {
    if ((this.activeIndex + 1) % this.numberOfItems === 0) {
      this.nextPage();
    }
    this.scrollIntoThumbnails();
  }

  /**
   * Sets the active index to the given index and emits the active index change
   * @param index The index to set as active
   */
  private setActiveIndex(index: number) {
    this.activeIndex = index;
    this.activeIndexChange.emit(index);
  }
}
