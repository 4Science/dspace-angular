import { Component, Input, OnInit } from '@angular/core';
import { SortDirection } from '../../../../core/cache/models/sort-options.model';
import { CarouselSection } from '../../../../core/layout/models/section.model';
import {CarouselOptions} from '../../../carousel/carousel-options.model';

/**
 * Component representing the Carousel component section.
 */
@Component({
    selector: 'ds-carousel-section',
    templateUrl: './carousel-section.component.html',
    styleUrls: ['./carousel-section.component.scss'],
    providers: []
})
export class CarouselSectionComponent implements OnInit {
  /**
   * The id of the current section.
   */
  @Input()
  sectionId: string;

  /**
   * Carousel section configurations.
   */
  @Input()
  carouselSection: CarouselSection;

  /**
   * Carousel options
   */
  carouselOptions: CarouselOptions;

  /**
   * The sort direction used for the search
   */
  @Input() sortOrder = 'desc';
  /**
   * The sort field used for the search
   */
  @Input() sortField = 'lastModified';

  /**
   * default value for field sorting
   */
  DEFAULT_SORT_FIELD = 'lastModified';


  ngOnInit() {
    this.carouselOptions = {
      description: this.carouselSection.description,
      link: this.carouselSection.link,
      title: this.carouselSection.title,
      keepAspectRatio: this.carouselSection.keepAspectRatio ?? false,
      carouselHeightPx: this.carouselSection.carouselHeightPx ?? 400,
      aspectRatio: this.carouselSection.aspectRatio ?? 5,
      fitWidth: this.carouselSection.fitWidth ?? false,
      fitHeight: this.carouselSection.fitHeight ?? false,
      targetBlank: this.carouselSection.targetBlank ?? true,
      captionStyle: this.carouselSection.captionStyle,
      titleStyle: this.carouselSection.titleStyle,
      bundle: this.carouselSection.bundle,
      discoveryConfiguration: this.carouselSection.discoveryConfigurationName,
      order: this.carouselSection.order,
      sortField: this.carouselSection.sortField ?? this.DEFAULT_SORT_FIELD,
      sortDirection:  this.carouselSection.order && this.carouselSection.order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC,
      //current carousel config has 0 as number of items for the pagination so would just load all items
      //TODO: Adjust numberOfItems on rest for desired pagination
      numberOfItems: this.carouselSection.numberOfItems &&  this.carouselSection.numberOfItems  > 0 ? this.carouselSection.numberOfItems : 5
    };
  }

}
