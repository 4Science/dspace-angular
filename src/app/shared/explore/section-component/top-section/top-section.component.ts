import { Component, Input, OnInit } from '@angular/core';

import { SortDirection, SortOptions } from '../../../../core/cache/models/sort-options.model';
import { LayoutModeEnum, TopSection, TopSectionTemplateType } from './../../../../core/layout/models/section.model';
import { PaginationComponentOptions } from '../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../../search/models/paginated-search-options.model';
import { Context } from '../../../../core/shared/context.model';
import { BehaviorSubject } from 'rxjs';

/**
 * Component representing the Top component section.
 */
@Component({
  selector: 'ds-top-section',
  templateUrl: './top-section.component.html'
})
export class TopSectionComponent implements OnInit {

  /**
   * The identifier of the section.
   */
  @Input()
  sectionId: string;

  /**
   * The section data
   */
  @Input()
  topSection: TopSection;

  /**
   * The context in which the section is shown
   */
  @Input()
  context: Context = Context.BrowseMostElements;

  /**
   * The paginated search options for the section
   */
  paginatedSearchOptions = new BehaviorSubject<PaginatedSearchOptions>(null);

  /**
   * The sort direction of the section.
   */
  sortOptions: SortOptions;

  /**
   * The template type for browse-most-elements
   */
  template: TopSectionTemplateType;

  layoutMode: LayoutModeEnum = LayoutModeEnum.CARD;

  ngOnInit() {
    const sortDirection = SortDirection[this.topSection.order?.toUpperCase()] ?? SortDirection.ASC;
    this.sortOptions = new SortOptions(this.topSection.sortField, sortDirection);
    this.template = this.topSection.template ?? TopSectionTemplateType.DEFAULT;
    this.selectDiscoveryConfiguration(this.topSection.discoveryConfigurationName);
  }

  /**
   * Changes the discovery configuration and updates the paginated search options accordingly.
   *
   * @param name - The name of the discovery configuration to change to.
   */
  selectDiscoveryConfiguration(name: string) {
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: `advanced-top-components-${name}-discovery-configuration`,
      pageSize: this.topSection.numberOfItems,
      currentPage: 1,
    });
    this.layoutMode = this.topSection.defaultLayoutMode;
    this.paginatedSearchOptions.next(new PaginatedSearchOptions({
      configuration: name,
      pagination: pagination,
      sort: this.sortOptions,
    }));
  }
}
