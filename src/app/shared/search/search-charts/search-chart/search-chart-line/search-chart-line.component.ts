import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';
import {
  filter,
  map,
} from 'rxjs/operators';

import { ChartComponent } from '../../../../../charts/components/chart/chart.component';
import { ChartData } from '../../../../../charts/models/chart-data';
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
import { isNotEmpty } from '../../../../empty.util';
import { FacetValues } from '../../../models/facet-values.model';
import { SearchFilterConfig } from '../../../models/search-filter-config.model';
import { facetLoad } from '../../../search-filters/search-filter/search-facet-filter/search-facet-filter.component';
import { SearchChartFilterComponent } from '../search-chart-filter/search-chart-filter.component';

@Component({
  selector: 'ds-search-chart-line',
  styleUrls: ['./search-chart-line.component.scss'],
  templateUrl: './search-chart-line.component.html',
  animations: [facetLoad],
  imports: [
    ChartComponent,
    NgIf,
    AsyncPipe,
    TranslateModule,
  ],
  standalone: true,
})
/**
 * Component that represents a search line chart filter
 */
export class SearchChartLineComponent extends SearchChartFilterComponent {

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

  protected getInitData(): Observable<ChartData[]> {
    return this.facetValues$.pipe(
      filter((facetValues: FacetValues[]) => isNotEmpty(facetValues)),
      map((facetValues: FacetValues[]) => facetValues[0]),
      map((facet: FacetValues) => ([{
        name: this.filter,
        series: facet.page.map((item) => ({
          name: item.value,
          value: item.count,
          extra: item,
        })),
      }] as ChartData[])),
    );
  }
}
