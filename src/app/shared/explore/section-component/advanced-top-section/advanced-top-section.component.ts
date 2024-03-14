import { HostWindowService } from './../../../host-window.service';
import { LayoutModeEnum } from './../../../../core/layout/models/section.model';
import { SortOptions } from './../../../../core/cache/models/sort-options.model';
import { PaginationComponentOptions } from './../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from './../../../search/models/paginated-search-options.model';
import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { AdvancedTopSection } from '../../../../core/layout/models/section.model';
import { Context } from '../../../../core/shared/context.model';
import { SortDirection } from '../../../../core/cache/models/sort-options.model';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import isEqual from 'lodash/isEqual';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'ds-advanced-top-section',
  templateUrl: './advanced-top-section.component.html',
  styleUrls: ['./advanced-top-section.component.scss']
})
export class AdvancedTopSectionComponent implements OnInit {
  /**
   * The identifier of the section.
   */
  @Input() sectionId: string;

  /**
   * Represents the advanced top section of the component.
   */
  @Input() advancedTopSection: AdvancedTopSection;

  /**
   * The context of the section.
   */
  @Input() context: Context = Context.BrowseMostElements;

  /**
   * The paginated search options for the section.
   */
  paginatedSearchOptions: PaginatedSearchOptions;

  /**
   * Whether to show the thumbnail preview
   */
  showThumbnails = true;

  /**
   * The view mode of the section. Defaults to card.
   */
  layoutMode: LayoutModeEnum = LayoutModeEnum.LIST;

  /**
   * The number of items to show in the section.
   * If endlessHorizontalScroll is true, the number of items is 5, otherwise it is 3.
   */
  maxNumberOfItems;

  /**
   * The name of the selected discovery configuration.
   */
  selectedDiscoverConfiguration: string;

  /**
   * The sort direction of the section.
   */
  sortDirection = SortDirection.ASC;

  /**
   * The total number of pages.
   */
  resultTotalPages: number;

  scrollContainerSelector = 'grid-wrapper';

  showAsCard = true;

  initialNumberOfElementsPerPage = 4;

  totalNumberOfElements = new BehaviorSubject<number>(0);

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private router: Router,
    private windowService: HostWindowService,
    private chd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const order = this.advancedTopSection.order;
    this.maxNumberOfItems = this.advancedTopSection.numberOfItems || 8;
    this.sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    this.selectedDiscoverConfiguration = this.advancedTopSection.discoveryConfigurationName[0];
    this.changeDiscovery(this.selectedDiscoverConfiguration);
  }

  /**
   * Determines whether the current page of the paginated search options has reached the start.
   * @returns {boolean} True if the current page is the first page, false otherwise.
   */
  get reachedStart() {
    return isEqual(this.paginatedSearchOptions.pagination.currentPage, 1);
  }

  /**
   * Determines whether the current page has reached the end of the search results.
   * @returns {boolean} True if the current page is the last page of search results, false otherwise.
   */
  get reachedEnd() {
 const maxNumberOfPages = this.totalNumberOfElements.getValue() >= this.maxNumberOfItems ? this.maxNumberOfItems : this.totalNumberOfElements.getValue();
  const totalPages = Math.ceil(maxNumberOfPages / this.initialNumberOfElementsPerPage);
  return this.paginatedSearchOptions.pagination.currentPage >= totalPages;
}

  /**
   * Changes the discovery configuration and updates the paginated search options accordingly.
   *
   * @param name - The name of the discovery configuration to change to.
   */
  changeDiscovery(name: string, currentPage: number = 1) {
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: 'search-object-pagination',
      pageSize: this.initialNumberOfElementsPerPage,
      currentPage: currentPage
    });
    this.selectedDiscoverConfiguration = name;
    this.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: name,
      pagination: pagination,
      sort: new SortOptions(this.advancedTopSection.sortField, this.sortDirection)
    });
  }

  /**
   * Get the items from the previous page and update the paginated search options accordingly.
   */
  scrollLeft() {
    const page = this.paginatedSearchOptions.pagination.currentPage - 1;
    this.changeDiscovery(this.selectedDiscoverConfiguration, page);
  }

  /**
   * Get the items from the next page and update the paginated search options accordingly.
   */
  scrollRight() {
    const page = this.paginatedSearchOptions.pagination.currentPage + 1;
    this.changeDiscovery(this.selectedDiscoverConfiguration, page);
  }

  /**
   * Navigates to the search page with the specified configuration.
   */
  async showAllResults() {
    await this.router.navigate(['/search'], {
      queryParams: {
        configuration: this.paginatedSearchOptions.configuration,
      },
      replaceUrl: true,
    });
  }

  /**
   * Sets the total number of elements.
   * @param totalElements - The total number of elements.
   */
  totalElements(totalNumber: number) {
    this.totalNumberOfElements.next(totalNumber);
    this.chd.detectChanges();
  }
}
