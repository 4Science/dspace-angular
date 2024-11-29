import {
  AsyncPipe,
  NgComponentOutlet,
  NgForOf,
} from '@angular/common';
import {
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { RemoteDataBuildService } from '../../../../../core/cache/builders/remote-data-build.service';
import { GenericConstructor } from '../../../../../core/shared/generic-constructor';
import { SearchService } from '../../../../../core/shared/search/search.service';
import { SearchConfigurationService } from '../../../../../core/shared/search/search-configuration.service';
import {
  FILTER_CONFIG,
  IN_PLACE_SEARCH,
  REFRESH_FILTER,
  SCOPE,
  SearchFilterService,
} from '../../../../../core/shared/search/search-filter.service';
import { SEARCH_CONFIG_SERVICE } from '../../../../../my-dspace-page/my-dspace-configuration.service';
import { FilterType } from '../../../models/filter-type.model';
import { SearchFilterConfig } from '../../../models/search-filter-config.model';
import {
  facetLoad,
  SearchFacetFilterComponent,
} from '../search-facet-filter/search-facet-filter.component';
import { SearchFacetRangeOptionComponent } from '../search-facet-filter-options/search-facet-range-option/search-facet-range-option.component';
import { renderFilterTypeEnvironment } from '../search-filter-type-decorator';

@Component({
  selector: 'ds-search-range-filter-wrapper',
  templateUrl: './search-range-filter-wrapper.component.html',
  styleUrls: ['./search-range-filter-wrapper.component.scss'],
  animations: [facetLoad],
  imports: [
    SearchFacetRangeOptionComponent,
    AsyncPipe,
    NgComponentOutlet,
    NgForOf,
  ],
  standalone: true,
})
export class SearchRangeFilterWrapperComponent extends SearchFacetFilterComponent implements OnInit, OnDestroy {

  /**
   * The constructor of the search facet filter that should be rendered, based on the filter config's type
   */
  searchFilter: GenericConstructor<SearchFacetFilterComponent>;
  /**
   * Injector to inject a child component with the @Input parameters
   */
  objectInjector: Injector;

  constructor(
    protected searchService: SearchService,
    protected filterService: SearchFilterService,
    protected rdbs: RemoteDataBuildService,
    protected router: Router,
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService,
    @Inject(IN_PLACE_SEARCH) public inPlaceSearch: boolean,
    @Inject(FILTER_CONFIG) public filterConfig: SearchFilterConfig,
    @Inject(REFRESH_FILTER) public refreshFilters: BehaviorSubject<boolean>,
    @Inject(SCOPE) public scope: string,
    @Inject(PLATFORM_ID) protected platformId: any,
    private injector: Injector,
  ) {
    super(searchService, filterService, rdbs, router, searchConfigService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.searchFilter = this.getRangeFilter();
    this.objectInjector = Injector.create({
      providers: [
        { provide: SEARCH_CONFIG_SERVICE, useFactory: () => (this.searchConfigService), deps: [] },
        { provide: IN_PLACE_SEARCH, useFactory: () => (this.inPlaceSearch), deps: [] },
        { provide: FILTER_CONFIG, useFactory: () => (this.filterConfig), deps: [] },
        { provide: PLATFORM_ID, useFactory: () => (this.platformId), deps: [] },
        { provide: REFRESH_FILTER, useFactory: () => (this.refreshFilters), deps: [] },
      ],
      parent: this.injector,
    });
  }

  /**
   * Find the correct component based on the filter config's type
   */
  private getRangeFilter() {
    return renderFilterTypeEnvironment(FilterType.range, environment, this.filterConfig.name);
  }

}
