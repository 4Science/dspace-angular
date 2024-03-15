import { HostWindowService, WidthCategory } from './../../../host-window.service';
import { SortOptions } from './../../../../core/cache/models/sort-options.model';
import { PaginationComponentOptions } from './../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from './../../../search/models/paginated-search-options.model';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AdvancedTopSection } from '../../../../core/layout/models/section.model';
import { Context } from '../../../../core/shared/context.model';
import { SortDirection } from '../../../../core/cache/models/sort-options.model';
import isEqual from 'lodash/isEqual';
import { BehaviorSubject, Subscription } from 'rxjs';
import { hasValue } from '../../../../shared/empty.util';

@Component({
  selector: 'ds-advanced-top-section',
  templateUrl: './advanced-top-section.component.html',
  styleUrls: ['./advanced-top-section.component.scss']
})
export class AdvancedTopSectionComponent implements OnInit, OnDestroy {
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

  /**
   * The initial number of elements per page.
   */
  initialNumberOfElementsPerPage = 4;

  /**
   * The total number of elements for discovery configuration.
   */
  totalNumberOfElements = new BehaviorSubject<number>(0);

  /**
   * The width category to number of elements per page map.
   */
  readonly widthCategoryToElementsMap = {
    [WidthCategory.XS]: 1,
    [WidthCategory.SM]: 1,
    [WidthCategory.MD]: 2,
    [WidthCategory.LG]: 3,
    [WidthCategory.XL]: 4,
  };

  /**
   * The subscriptions for the component.
   */
  subs: Subscription[] = [];

  constructor(
    private windowService: HostWindowService,
    private chd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const order = this.advancedTopSection.order;
    this.maxNumberOfItems = this.advancedTopSection.numberOfItems || 8;
    this.sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    this.selectedDiscoverConfiguration = this.advancedTopSection.discoveryConfigurationName[0];
    // Set the initial number of elements per page based on the current width category.
    Object.entries(this.widthCategoryToElementsMap).forEach(([category, elementsPerPage]) => {
      this.subs.push(this.windowService.isIn([parseInt(category, 10)]).subscribe((isIn: boolean) => {
        if (isIn) {
          this.initialNumberOfElementsPerPage = elementsPerPage;
        }
        this.changeDiscovery(this.selectedDiscoverConfiguration);
      }));
    });
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
   * Calculates the total number of pages based on the total number of elements and the initial number of elements per page.
   * If the total number of elements is greater than the maximum number of items,
   * the total number of pages is the maximum number of items divided by the initial number of elements per page.
   * @returns {boolean} True if the current page is the last page of search results, false otherwise.
   */
  get reachedEnd() {
    const maxNumberOfPages = this.totalNumberOfElements.getValue() >= this.maxNumberOfItems
                           ? this.maxNumberOfItems : this.totalNumberOfElements.getValue();

    const totalPages = Math.ceil(maxNumberOfPages / this.initialNumberOfElementsPerPage);
    return this.paginatedSearchOptions.pagination.currentPage >= totalPages;
  }

  /**
   * Changes the discovery configuration and updates the paginated search options accordingly.
   *
   * @param name - The name of the discovery configuration to change to.
   */
  changeDiscovery(name: string, currentPage: number = 1, pageSize?: number) {
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: 'search-object-pagination',
      pageSize: pageSize ?? this.initialNumberOfElementsPerPage,
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
   * Checks not to exceed the maximum number of items set in the configuration.
   */
  scrollRight() {
    const totalElementsDisplayed = this.initialNumberOfElementsPerPage * this.paginatedSearchOptions.pagination.currentPage;
    const page = this.paginatedSearchOptions.pagination.currentPage + 1;
    if ((totalElementsDisplayed + this.initialNumberOfElementsPerPage) > this.maxNumberOfItems) {
      const pageSize = this.maxNumberOfItems - totalElementsDisplayed;
      this.changeDiscovery(this.selectedDiscoverConfiguration, page, pageSize);
    } else {
      this.changeDiscovery(this.selectedDiscoverConfiguration, page);
    }
  }

  /**
   * Sets the total number of elements.
   * @param totalElements - The total number of elements.
   */
  totalElements(totalNumber: number) {
    this.totalNumberOfElements.next(totalNumber);
    this.chd.detectChanges();
  }

  /**
   * Unsubscribe from all subscriptions.
   */
  ngOnDestroy(): void {
    this.subs.filter(s => hasValue(s)).forEach((sub) => sub.unsubscribe());
  }
}
