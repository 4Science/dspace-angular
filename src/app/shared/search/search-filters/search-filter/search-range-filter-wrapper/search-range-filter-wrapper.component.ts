import {
  AsyncPipe,
  NgComponentOutlet,
  NgForOf,
} from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../../../../environments/environment';
import { RemoteDataBuildService } from '../../../../../core/cache/builders/remote-data-build.service';
import { GenericConstructor } from '../../../../../core/shared/generic-constructor';
import { SearchService } from '../../../../../core/shared/search/search.service';
import { SearchConfigurationService } from '../../../../../core/shared/search/search-configuration.service';
import { SearchFilterService } from '../../../../../core/shared/search/search-filter.service';
import { SEARCH_CONFIG_SERVICE } from '../../../../../my-dspace-page/my-dspace-configuration.service';
import { FilterType } from '../../../models/filter-type.model';
import {
  facetLoad,
  SearchFacetFilterComponent,
} from '../search-facet-filter/search-facet-filter.component';
import { SearchFacetRangeOptionComponent } from '../search-facet-filter-options/search-facet-range-option/search-facet-range-option.component';
import { renderFilterTypeEnvironment } from '../search-filter-type-environment-decorator';

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
  @ViewChild('containerFilters', { read: ViewContainerRef }) vcr!: ViewContainerRef;

  constructor(
    protected searchService: SearchService,
    protected filterService: SearchFilterService,
    protected rdbs: RemoteDataBuildService,
    protected router: Router,
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService,
    @Inject(PLATFORM_ID) public platformId: any,
  ) {
    super(searchService, filterService, rdbs, router, searchConfigService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.createFilterComponent();
  }

  /**
   * Find the correct component based on the filter config's type
   */
  private getRangeFilter() {
    return renderFilterTypeEnvironment(FilterType.range, environment, this.filterConfig.name);
  }

  /**
   * Initialize and add the filter config to the injector
   */
  private createFilterComponent() {
    if (this.vcr) {
      this.searchFilter = this.getRangeFilter();
      this.vcr.clear();
      const componentRef = this.vcr.createComponent(this.searchFilter);
      componentRef.setInput('filterConfig', this.filterConfig);
      componentRef.setInput('inPlaceSearch', this.inPlaceSearch);
      componentRef.setInput('refreshFilters', this.refreshFilters);
      componentRef.setInput('scope', this.scope);
    }
  }

}
