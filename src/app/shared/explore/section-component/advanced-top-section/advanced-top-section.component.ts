import { Component, Input, OnInit } from '@angular/core';
import { SortDirection, SortOptions } from '../../../../core/cache/models/sort-options.model';
import { AdvancedTopSection, TopSectionTemplateType } from '../../../../core/layout/models/section.model';
import { PaginationComponentOptions } from '../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../../search/models/paginated-search-options.model';
import { Context } from '../../../../core/shared/context.model';
import { BehaviorSubject } from 'rxjs';

/**
 * Component representing the Advanced-Top component section.
 */
@Component({
  selector: 'ds-advanced-top-section',
  templateUrl: './advanced-top-section.component.html',
})
export class AdvancedTopSectionComponent implements OnInit {

  // TODO: Duplicate code - Extend TopSectionComponent if possible

  /**
   * The identifier of the section.
   */
  @Input()
  sectionId: string;

  /**
   * The section data
   */
  @Input()
  advancedTopSection: AdvancedTopSection;

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

  /**
   * The name of the selected discovery configuration.
   */
  selectedDiscoverConfiguration = new BehaviorSubject<string>(null);

  ngOnInit() {
    const sortDirection = SortDirection[this.advancedTopSection.order?.toUpperCase()] ?? SortDirection.ASC;
    this.sortOptions = new SortOptions(this.advancedTopSection.sortField, sortDirection);
    this.template = this.advancedTopSection.template ?? TopSectionTemplateType.DEFAULT;
    this.selectDiscoveryConfiguration(this.advancedTopSection.discoveryConfigurationName[0]); // ADVANCED top sections use an ARRAY of configurations
  }

  /**
   * Changes the discovery configuration and updates the paginated search options accordingly.
   *
   * @param name - The name of the discovery configuration to change to.
   */
  selectDiscoveryConfiguration(name: string) {
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: `advanced-top-components-${name}-discovery-configuration`,
      pageSize: this.advancedTopSection.numberOfItems,
      currentPage: 1,
    });
    this.selectedDiscoverConfiguration.next(name);
    this.paginatedSearchOptions.next(new PaginatedSearchOptions({
      configuration: name,
      pagination: pagination,
      sort: this.sortOptions,
    }));
  }

}
