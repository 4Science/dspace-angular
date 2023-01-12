import { LayoutModeEnum, TopSection } from '../../../../../../../app/core/layout/models/section.model';
import { Component, Input, OnInit } from '@angular/core';

import { SortDirection, SortOptions } from '../../../../../../../app/core/cache/models/sort-options.model';
import { Context } from '../../../../../../../app/core/shared/context.model';
import { PaginatedSearchOptions } from '../../../../../../../app/shared/search/models/paginated-search-options.model';
import { PaginationComponentOptions } from '../../../../../../../app/shared/pagination/pagination-component-options.model';

/**
 * Component representing the Top component section.
 */
@Component({
  selector: 'ds-top-section',
  templateUrl: './top-section.component.html'
})
export class TopSectionComponent implements OnInit {

  @Input()
  sectionId: string;

  @Input()
  topSection: TopSection;

  @Input()
  context: Context = Context.BrowseMostElements;

  paginatedSearchOptions: PaginatedSearchOptions;

  layoutMode: LayoutModeEnum = LayoutModeEnum.CARD;

  ngOnInit() {
    const order = this.topSection.order;
    const numberOfItems = this.topSection.numberOfItems;
    const sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: 'search-object-pagination',
      pageSize: numberOfItems,
      currentPage: 1
    });
    this.layoutMode = this.topSection.defaultLayoutMode;
    this.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: this.topSection.discoveryConfigurationName,
      pagination: pagination,
      sort: new SortOptions(this.topSection.sortField, sortDirection)
    });
  }
}
