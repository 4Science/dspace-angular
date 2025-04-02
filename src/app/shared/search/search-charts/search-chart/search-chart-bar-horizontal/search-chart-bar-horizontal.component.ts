import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import isEqual from 'lodash/isEqual';
import { BehaviorSubject } from 'rxjs';

import { ChartComponent } from '../../../../../charts/components/chart/chart.component';
import { RemoteDataBuildService } from '../../../../../core/cache/builders/remote-data-build.service';
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
import { facetLoad } from '../../../search-filters/search-filter/search-facet-filter/search-facet-filter.component';
import { SearchChartFilterComponent } from '../search-chart-filter/search-chart-filter.component';

@Component({
  selector: 'ds-search-chart-bar-horizontal',
  templateUrl: './search-chart-bar-horizontal.component.html',
  styleUrls: ['./search-chart-bar-horizontal.component.scss'],
  animations: [facetLoad],
  imports: [
    NgIf,
    AsyncPipe,
    ChartComponent,
    TranslateModule,
  ],
  standalone: true,
})
/**
 * Component that represents a search horizontal/reverse-horizontal bar chart filter
 */
export class SearchChartBarHorizontalComponent extends SearchChartFilterComponent implements OnInit {

  constructor(
    protected searchService: SearchService,
    protected filterService: SearchFilterService,
    protected rdbs: RemoteDataBuildService,
    protected router: Router,
    protected translate: TranslateService,
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService,
    @Inject(IN_PLACE_SEARCH) public inPlaceSearch: boolean,
    @Inject(FILTER_CONFIG) public filterConfig: SearchFilterConfig,
    @Inject(REFRESH_FILTER) public refreshFilters: BehaviorSubject<boolean>,
    @Inject(SCOPE) public scope: string,
  ) {
    super(searchService, filterService, rdbs, router, searchConfigService);
  }

  ngOnInit() {
    super.ngOnInit();
    if (
      isEqual(
        this.filterConfig.filterType,
        FilterType['chart.reverse-bar.horizontal'],
      )
    ) {
      this.isReverseChart = true;
    }
  }
}
