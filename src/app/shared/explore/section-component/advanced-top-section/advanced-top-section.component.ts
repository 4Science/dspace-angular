import { LayoutModeEnum } from './../../../../core/layout/models/section.model';
import { SortOptions } from './../../../../core/cache/models/sort-options.model';
import { PaginationComponentOptions } from './../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from './../../../search/models/paginated-search-options.model';
import { Component, Inject, Input, OnInit, AfterViewInit } from '@angular/core';
import { AdvancedTopSection } from '../../../../core/layout/models/section.model';
import { Context } from '../../../../core/shared/context.model';
import { SortDirection } from '../../../../core/cache/models/sort-options.model';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

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
  layoutMode: LayoutModeEnum = LayoutModeEnum.CARD;

  /**
   * The number of items to show in the section.
   * If endlessHorizontalScroll is true, the number of items is 5, otherwise it is 3.
   */
  numberOfItems = 5;

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
   * Flag to determine if the section should have endless horizontal scroll.
   */
  endlessHorizontalScroll = false;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private router: Router,
  ) {
  }

  ngOnInit() {
    const order = this.advancedTopSection.order;
    this.endlessHorizontalScroll = this.advancedTopSection.endlessHorizontalScroll;
    this.numberOfItems = !this.advancedTopSection.endlessHorizontalScroll ? 3 : 5;
    this.sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    this.selectedDiscoverConfiguration = this.advancedTopSection.discoveryConfigurationName[0];

    this.changeDiscovery(this.selectedDiscoverConfiguration);
  }

  /**
   * After the view is initialized, get the scroll container of the section.
   */
  ngAfterViewInit() {
    this.scrollContainer = this._document.getElementsByClassName('card-columns');
  }

  /**
   * Changes the discovery configuration and updates the paginated search options accordingly.
   *
   * @param name - The name of the discovery configuration to change to.
   */
  changeDiscovery(name: string) {
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: 'search-object-pagination',
      pageSize: this.numberOfItems,
      currentPage: 1
    });
    this.selectedDiscoverConfiguration = name;
    this.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: name,
      pagination: pagination,
      sort: new SortOptions(this.advancedTopSection.sortField, this.sortDirection)
    });
  }

  /**
   * Scrolls the container to the left by a specified amount.
   */
  scrollLeft() {
    this.scrollContainer[0].scrollBy({ left: -100, behavior: 'smooth' });
  }

  /**
   * Scrolls the container element to the right by a specified amount.
   */
  scrollRight() {
    this.scrollContainer[0].scrollBy({ left: 100, behavior: 'smooth' });
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
}
