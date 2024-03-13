import { LayoutModeEnum } from './../../../../core/layout/models/section.model';
import { SortOptions } from './../../../../core/cache/models/sort-options.model';
import { PaginationComponentOptions } from './../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from './../../../search/models/paginated-search-options.model';
import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';
import { AdvancedTopSection } from '../../../../core/layout/models/section.model';
import { Context } from '../../../../core/shared/context.model';
import { SortDirection } from '../../../../core/cache/models/sort-options.model';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import isEqual from 'lodash/isEqual';

@Component({
  selector: 'ds-advanced-top-section',
  templateUrl: './advanced-top-section.component.html',
  styleUrls: ['./advanced-top-section.component.scss']
})
export class AdvancedTopSectionComponent implements OnInit, AfterViewInit {
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
  showThumbnails = false;

  /**
   * The view mode of the section. Defaults to card.
   */
  layoutMode: LayoutModeEnum = LayoutModeEnum.LIST;

  /**
   * The number of items to show in the section.
   * If endlessHorizontalScroll is true, the number of items is 5, otherwise it is 3.
   */
  numberOfItems;

  /**
   * The name of the selected discovery configuration.
   */
  selectedDiscoverConfiguration: string;

  /**
   * The sort direction of the section.
   */
  sortDirection = SortDirection.ASC;

  /**
   * The scroll container of the section.
   */
  scrollContainer: HTMLCollectionOf<Element>;

  /**
   * The total number of pages.
   */
  resultTotalPages: number;

  scrollContainerSelector = 'grid-wrapper';

  showAsCard = true;

  totalElementsNumber: number;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private router: Router,
  ) { }

  ngOnInit() {
    const order = this.advancedTopSection.order;
    this.numberOfItems = this.advancedTopSection.numberOfItems || 8;
    this.sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    this.selectedDiscoverConfiguration = this.advancedTopSection.discoveryConfigurationName[0];
    this.changeDiscovery(this.selectedDiscoverConfiguration);
  }

  ngAfterViewInit() {
    this.scrollContainer = this._document.getElementsByClassName(this.scrollContainerSelector);
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
    return isEqual(this.resultTotalPages, this.paginatedSearchOptions.pagination.currentPage);
  }

  /**
   * Changes the discovery configuration and updates the paginated search options accordingly.
   *
   * @param name - The name of the discovery configuration to change to.
   */
  changeDiscovery(name: string, currentPage: number = 1) {
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: 'search-object-pagination',
      pageSize: this.numberOfItems,
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
    if (this.scrollContainer[0].scrollLeft > 0) {
      // not reached the start of the scroll yet => scroll left
      this.scrollContainer[0].scrollBy({ left: -100, behavior: 'smooth' });
    } else {
      // reached the start of the scroll, get the previous page
      const page = this.paginatedSearchOptions.pagination.currentPage - 1;
      this.changeDiscovery(this.selectedDiscoverConfiguration, page);

      if (this.reachedStart) {
        this.scrollContainer[0].scrollLeft = 0;
      } else {
        this.scrollContainer[0].scrollLeft = this.scrollContainer[0].scrollWidth;
      }
    }
  }

  /**
   * Get the items from the next page and update the paginated search options accordingly.
   */
  scrollRight() {
    const container = this.scrollContainer[0];
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    if (container.scrollLeft >= maxScrollLeft) {
      // reached the end of the scroll, get the next page
      this.scrollContainer[0].scrollLeft = 0;
      const page = this.paginatedSearchOptions.pagination.currentPage + 1;
      this.changeDiscovery(this.selectedDiscoverConfiguration, page);
    } else {
      // not reached the end of the scroll yet => scroll right
      this.scrollContainer[0].scrollBy({ left: 100, behavior: 'smooth' });
    }
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
   * Sets the total number of pages and checks if the current page has reached the end.
   * @param pageNumber - The total number of pages.
   */
  totalPagesNumber(pageNumber: number) {
    this.resultTotalPages = pageNumber || 0;
  }

  /**
   * Sets the total number of elements.
   * @param totalElements - The total number of elements.
   */
  totalElements(totalElements: number) {
    this.totalElementsNumber = totalElements || 0;
  }
}
