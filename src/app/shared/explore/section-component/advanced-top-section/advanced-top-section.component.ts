import { LayoutModeEnum } from './../../../../core/layout/models/section.model';
import { SortOptions } from './../../../../core/cache/models/sort-options.model';
import { PaginationComponentOptions } from './../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from './../../../search/models/paginated-search-options.model';
import { Component, Inject, Input, OnInit, AfterViewInit } from '@angular/core';
import { AdvancedTopSection } from '../../../../core/layout/models/section.model';
import { Context } from '../../../../core/shared/context.model';
import { SortDirection } from 'src/app/core/cache/models/sort-options.model';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'ds-advanced-top-section',
  templateUrl: './advanced-top-section.component.html',
  styleUrls: ['./advanced-top-section.component.scss']
})
export class AdvancedTopSectionComponent implements OnInit {
  @Input()
  sectionId: string;

  @Input()
  advancedTopSection: AdvancedTopSection;

  @Input()
  context: Context = Context.BrowseMostElements;

  paginatedSearchOptions: PaginatedSearchOptions;

  showThumbnails = false;

  layoutMode: LayoutModeEnum = LayoutModeEnum.CARD;

  numberOfItems = 4;

  selectedDiscoverConfiguration: string;

  sortDirection = SortDirection.ASC;

  scrollContainer: any;

  /**
   *
   */
  constructor(@Inject(DOCUMENT) private _document: Document,) {
  }

  ngOnInit() {
    const order = this.advancedTopSection.order;
    this.sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    this.selectedDiscoverConfiguration = this.advancedTopSection.discoveryConfigurationName[0];

    this.changeDiscovery(this.selectedDiscoverConfiguration);
  }

  ngAfterViewInit() {
    this.scrollContainer = this._document.getElementsByClassName('card-columns');
    console.log('AdvancedTopSectionComponent AfterViewInit', this.scrollContainer);
  }

  changeDiscovery(name: string){
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


  scrollLeft() {
    this.scrollContainer[0].scrollBy({ left: -100, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer[0].scrollBy({ left: 100, behavior: 'smooth' });
  }
}
