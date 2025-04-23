import {
  AsyncPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NgbCarousel,
  NgbCarouselModule,
  NgbSlideEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import {
  APP_CONFIG,
  AppConfig,
} from '../../../config/app-config.interface';
import { Item } from '../../core/shared/item.model';
import { getItemPageRoute } from '../../item-page/item-page-routing-paths';
import { CarouselOptions } from '../carousel/carousel-options.model';
import { HostWindowService } from '../host-window.service';

@Component({
  selector: 'ds-base-carousel-with-thumbnails',
  templateUrl: './carousel-with-thumbnails.component.html',
  styleUrls: ['./carousel-with-thumbnails.component.scss'],
  standalone: true,
  imports: [
    NgbCarouselModule,
    NgStyle,
    AsyncPipe,
    NgIf,
    NgClass,
    RouterLink,
    NgTemplateOutlet,
    TranslateModule,
    ThumbnailSliderComponent,
    NgForOf,
  ],
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
   * The initial number of items to display per page ,
   */
  defaultPageSize = 4;

  /**
   * The number of items to display per page
   */
  pageSize = this.defaultPageSize;

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

  /**
   * The height of the vertical thumbnail
   */
  thumbnailHeightPx = 120;

  /**
   * The width of the horizontal thumbnail
   */
  thumbnailWidthPx = 160;

  /**
   * The ratio of the small image height to the big image height
   */
  smallImageHeightRatio = 0.25;

  /**
   * The event of the slider
   */
  sliderEventSource: NgbSlideEvent;

  public readonly bundle: string;

  constructor(
    private hostWindowService: HostWindowService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
  ) {
    this.bundle = this.appConfig.bundle.previewBundle;
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

    // Calculate the height of the small images
    this.thumbnailHeightPx = this.carouselOptions.carouselHeightPx * this.smallImageHeightRatio;

    this.hostWindowService.isXs().subscribe((isXs) => {
      this.isSmallDevice$.next(isXs);
      if (isXs) {
        this.pageSize = 2;
      }  else {
        this.pageSize = this.defaultPageSize;
      }
    });
  }

  /**
   * Sets the active item to the item at the given index.
   */
  onSlide(slideEvent: NgbSlideEvent) {
    this.activeItemIndex = +slideEvent.current.split('ngb-slide-')[1];
    this.activeItem = this.itemList[this.activeItemIndex];
    this.sliderEventSource = slideEvent;
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
