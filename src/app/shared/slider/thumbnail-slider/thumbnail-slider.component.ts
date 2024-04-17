import { Item } from '../../../core/shared/item.model';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { SEARCH_CONFIG_SERVICE } from '../../../my-dspace-page/my-dspace-page.component';
import { NativeWindowService, NativeWindowRef } from '../../../core/services/window.service';
import { SearchManager } from '../../../core/browse/search-manager';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { SearchConfig } from '../../../core/shared/search/search-filters/search-config.model';
import { SortDirection } from '../../../core/cache/models/sort-options.model';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { SliderComponent } from '../slider.component';
import { BitstreamImagesService } from '../../../core/services/bitstream-images.service';

@Component({
  selector: 'ds-thumbnail-slider',
  templateUrl: './thumbnail-slider.component.html',
  styleUrls: ['./thumbnail-slider.component.scss'],
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ]
})
export class ThumbnailSliderComponent extends SliderComponent {

  activeIndex = 0;

  @Input() scope: string;

  @Input() activeItemIndexInOuterIndicator: number;

  @Output() onThumbnailSelected: EventEmitter<Item> = new EventEmitter<Item>();

  @Output() activeIndexChange: EventEmitter<number> = new EventEmitter<number>();

  @Input() height: number;

  @Input() isHorizontal = false;

  /**
   * The thumbnail container element (used to scroll to the active thumbnail)
   */
  @ViewChild('thumbnailContainer') thumbnailContainer: ElementRef;

  /**
   * The thumbnails of the items in the carousel
   */
  @ViewChildren('thumbnails') thumbnailList: ElementRef[];

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    protected cdr: ChangeDetectorRef,
    protected searchManager: SearchManager,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    // protected breakpointObserver: BreakpointObserver,
    @Inject(SEARCH_CONFIG_SERVICE) private searchConfigService: SearchConfigurationService,
  ) {
    super(bitstreamDataService, bitstreamImagesService, cdr, searchManager, _window);
  }

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.activeItemIndexInOuterIndicator) {
      this.setActiveIndex(changes.activeItemIndexInOuterIndicator.currentValue);
      this.checkAndGetNextPage();
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

  onThumbnailClick(item: Item, index: number) {
    this.setActiveIndex(index);
    this.onThumbnailSelected.emit(item);
  }

    /**
   * If the active thumbnail is not in view, the container is scrolled to the active thumbnail
   */
    scrollIntoThumbnails() {
      const thumbnail = this.thumbnailList?.find((element, index) => index === this.activeIndex);
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

  getNext() {
    const index = this.activeIndex + 1;
    this.setActiveIndex(index);
    this.checkAndGetNextPage();
  }

  getPrev() {
    const index = this.activeIndex - 1;
    this.setActiveIndex(index);
    this.previousPage();
  }

  private checkAndGetNextPage() {
    if ((this.activeIndex + 1) % this.numberOfItems === 0) {
      this.nextPage();
    }
    this.scrollIntoThumbnails();
  }

  private setActiveIndex(index: number) {
    this.activeIndex = index;
    this.activeIndexChange.emit(index);
  }
}
