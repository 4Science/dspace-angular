import { Component, inject, Input, OnInit } from '@angular/core';
import { SortDirection, SortOptions } from '../../../../core/cache/models/sort-options.model';
import { AdvancedTopSection, TopSectionTemplateType } from '../../../../core/layout/models/section.model';
import { PaginationComponentOptions } from '../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../../search/models/paginated-search-options.model';
import { Context } from '../../../../core/shared/context.model';
import {BehaviorSubject, forkJoin, Observable} from 'rxjs';
import { HostWindowService } from '../../../host-window.service';
import {SearchService} from '../../../../core/shared/search/search.service';
import { map, take } from 'rxjs/operators';
import {RemoteData} from '../../../../core/data/remote-data';
import {SearchObjects} from '../../../search/models/search-objects.model';
import {DSpaceObject} from '../../../../core/shared/dspace-object.model';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';

/**
 * Component representing the Advanced-Top component section.
 */
@Component({
  selector: 'ds-advanced-top-section',
  templateUrl: './advanced-top-section.component.html',
  styleUrls: ['./advanced-top-section.component.scss'],
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

  private readonly windowService = inject(HostWindowService);

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

  discoveryConfigurationsTotalElementsMap: Map<string, number> = new Map<string, number>();

  constructor(private searchService: SearchService) { }

  ngOnInit() {
    const sortDirection = SortDirection[this.advancedTopSection.order?.toUpperCase()] ?? SortDirection.ASC;
    this.sortOptions = new SortOptions(this.advancedTopSection.sortField, sortDirection);
    this.template = this.advancedTopSection.template ?? TopSectionTemplateType.DEFAULT;
    this.selectDiscoveryConfiguration(this.advancedTopSection.discoveryConfigurationName[0]); // ADVANCED top sections use an ARRAY of configurations
    this.setDiscoveryConfigurationsTotalElementsMap();
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

  isXs() {
    return this.windowService.isXs();
  }

  /**
   * Sends a search request with a pagination of 1 item to get the total number of search results.
   * In order not to display the configurations with no results.
   * @param configName - The name of the discovery configuration
   */
  getSearchResultTotalNumber(configName: string): Observable<number> {
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: `advanced-top-components-${configName}-discovery-configuration-total`,
      pageSize: 1,
      currentPage: 1,
    });
    const paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: configName,
      pagination: pagination,
      sort: this.sortOptions,
    });
    return this.searchService.search(paginatedSearchOptions).pipe(
      getFirstCompletedRemoteData(),
      take(1),
      map((searchResults: RemoteData<SearchObjects<DSpaceObject>>) => searchResults?.payload?.pageInfo?.totalElements ?? 0)
    );
  }

  setDiscoveryConfigurationsTotalElementsMap() {
    const observables = this.advancedTopSection.discoveryConfigurationName.map((configName: string) =>
      this.getSearchResultTotalNumber(configName).pipe(
        map((totalElements: number) => ({ configName, totalElements }))
      )
    );

    forkJoin(observables).subscribe(results => {
      results.forEach(({ configName, totalElements }) => {
        this.discoveryConfigurationsTotalElementsMap.set(configName, totalElements);
      });
    });
  }
}
