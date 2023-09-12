import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SortDirection, SortOptions } from '../../../../core/cache/models/sort-options.model';
import { PaginatedList } from '../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { DSpaceObjectType } from '../../../../core/shared/dspace-object-type.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';
import { SearchService } from '../../../../core/shared/search/search.service';
import { PaginationComponentOptions } from '../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../../search/models/paginated-search-options.model';
import { SearchResult } from '../../../search/models/search-result.model';
import { SliderSection } from '../../../../core/layout/models/section.model';

/**
 * Component representing the Slider component section.
 */
@Component({
    selector: 'ds-slider-section',
    templateUrl: './slider-section.component.html',
    styleUrls: ['./slider-section.component.scss'],
})
export class SliderSectionComponent implements OnInit {
  /**
   * The id of the current section.
   */
  @Input() sectionId: string;

  /**
   * Carousel section configurations.
   */
  @Input() sliderSection: SliderSection;

  /**
   * Search results of provided carousel configurations.
   */
  searchResults$: Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>>;

  /**
   * Paginated Search Options of current carousel configurations.
   */
  paginatedSearchOptions: PaginatedSearchOptions;

  /**
   * Loader before results appear
   */
  isLoading$ = new BehaviorSubject(true);

  /**
   * default value for field sorting
   */
  DEFAULT_SORT_FIELD = 'lastModified';

  /**
   * default value for field sorting direction
   */
  DEFAULT_SORT_DIRECTION = 'desc';

  constructor (private searchService: SearchService) {}

  ngOnInit() {
    const discoveryConfigurationName = this.sliderSection.discoveryConfigurationName;
    const order = this.sliderSection.order ?? this.DEFAULT_SORT_DIRECTION;
    const sortField = this.sliderSection.sortField ?? this.DEFAULT_SORT_FIELD;
    const numberOfItems = this.sliderSection.numberOfItems;
    const sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;

    const pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
      id: 'slider-object-pagination',
      pageSize: numberOfItems,
      currentPage: 1
    });

    this.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: discoveryConfigurationName,
      pagination: pagination,
      sort: new SortOptions(sortField, sortDirection),
      dsoTypes: [DSpaceObjectType.ITEM],
      forcedEmbeddedKeys: ['bundles']
    });

    this.searchResults$ = this.searchService.search(this.paginatedSearchOptions).pipe(
      getFirstCompletedRemoteData(),
      tap(() => this.isLoading$.next(false)),
    );
  }

}
