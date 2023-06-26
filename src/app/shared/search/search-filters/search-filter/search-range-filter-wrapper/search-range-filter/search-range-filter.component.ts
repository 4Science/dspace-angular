import { BehaviorSubject, from, Observable, of, Subscription, switchMap } from 'rxjs';
import { map, take, tap, withLatestFrom } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RemoteDataBuildService } from '../../../../../../core/cache/builders/remote-data-build.service';
import { FilterType } from '../../../../models/filter-type.model';
import { renderFacetForEnvironment } from '../../search-filter-type-decorator';
import { facetLoad, SearchFacetFilterComponent } from '../../search-facet-filter/search-facet-filter.component';
import { SearchFilterConfig } from '../../../../models/search-filter-config.model';
import {
  FILTER_CONFIG,
  IN_PLACE_SEARCH,
  REFRESH_FILTER,
  SearchFilterService
} from '../../../../../../core/shared/search/search-filter.service';
import { SearchService } from '../../../../../../core/shared/search/search.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../../../../core/shared/search/search-configuration.service';
import { hasValue, isNotEmpty } from '../../../../../empty.util';
import { yearFromString } from 'src/app/shared/date.util';

/**
 * The suffix for a range filters' minimum in the frontend URL
 */
export const RANGE_FILTER_MIN_SUFFIX = '.min';

/**
 * The suffix for a range filters' maximum in the frontend URL
 */
export const RANGE_FILTER_MAX_SUFFIX = '.max';

/**
 * This component renders a simple item page.
 * The route parameter 'id' is used to request the item it represents.
 * All fields of the item that should be displayed, are defined in its template.
 */
@Component({
  selector: 'ds-search-range-filter',
  styleUrls: ['./search-range-filter.component.scss'],
  templateUrl: './search-range-filter.component.html',
  animations: [facetLoad]
})

/**
 * Component that represents a range facet for a specific filter configuration
 */
@renderFacetForEnvironment(FilterType.range)
export class SearchRangeFilterComponent extends SearchFacetFilterComponent implements OnInit, OnDestroy {

  /**
   * The date formats that are possible to appear in a date filter
   */
  protected readonly dateFormats = ['yyyy', 'yyyy-MM', 'yyyy-MM-DD'];

  /**
   * Fallback minimum for the range
   */
  min = 1950;

  /**
   * Fallback maximum for the range
   */
  max = new Date().getUTCFullYear();

  /**
   * The current range of the filter
   */
  range;

  /**
   * Subscription to unsubscribe from
   */
  sub: Subscription;

  /**
   * Whether the sider is being controlled by the keyboard.
   * Supresses any changes until the key is released.
   */
  keyboardControl: boolean;

  constructor(
    protected searchService: SearchService,
    protected filterService: SearchFilterService,
    protected router: Router,
    protected rdbs: RemoteDataBuildService,
    protected route: ActivatedRoute,
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService,
    @Inject(IN_PLACE_SEARCH) public inPlaceSearch: boolean,
    @Inject(FILTER_CONFIG) public filterConfig: SearchFilterConfig,
    @Inject(PLATFORM_ID) protected platformId: any,
    @Inject(REFRESH_FILTER) public refreshFilters: BehaviorSubject<boolean>
  ) {
    super(searchService, filterService, rdbs, router, searchConfigService, inPlaceSearch, filterConfig, refreshFilters);
  }

  /**
   * Initialize with the min and max values as configured in the filter configuration
   * Set the initial values of the range
   */
  ngOnInit() {
    super.ngOnInit();
    this.initMin();
    this.initMax();
    this.sub = this.getMinMaxParams().subscribe((minmax) => this.initRange(minmax));
  }

  /**
   * initializes the date range
   * @param minmax
   * @protected
   */
  protected initRange(minmax: [string | null, string | null]) {
    console.log('init range', minmax);
    this.range = minmax;
  }

  /**
   * initializes the maximum value allowed
   * @protected
   */
  protected initMax() {
    this.max = yearFromString(this.filterConfig.maxValue) || this.max;
  }

  /**
   * initializes the minimum value allowed
   * @protected
   */
  protected initMin() {
    this.min = yearFromString(this.filterConfig.minValue) || this.min;
    console.log('initMin', this.min);
  }

  /**
   * retrieves the query parameters for this {@link filterConfig}
   * @protected
   */
  protected getMinMaxParams(): Observable<[string, string]> {
    console.log('getMinMaxParams');
    return this.route.queryParamMap
      .pipe(
        tap(console.log),
        map(paramMaps => [
          paramMaps.get(this.filterConfig.paramName + RANGE_FILTER_MIN_SUFFIX) ?? `${this.min}`,
          paramMaps.get(this.filterConfig.paramName + RANGE_FILTER_MAX_SUFFIX) ?? `${this.max}`
        ]),
        tap(console.log)
      );
  }

  /**
   * Submits new custom range values to the range filter from the widget
   */
  onSubmit() {
    if (this.keyboardControl) {
      return;  // don't submit if a key is being held down
    }

    const newMin = this.range[0] !== this.min ? [this.range[0]] : null;
    const newMax = this.range[1] !== this.max ? [this.range[1]] : null;
    this.search(newMin, newMax);
  }

  startKeyboardControl(): void {
    this.keyboardControl = true;
  }

  stopKeyboardControl(): void {
    this.keyboardControl = false;
  }

  /**
   * TODO when upgrading nouislider, verify that this check is still needed.
   * Prevents AoT bug
   * @returns {boolean} True if the platformId is a platform browser
   */
  shouldShowSlider(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Sends a request of search using the router navigation
   *
   * @param minDate minimum range parameter to search for
   * @param maxDate maximum range parameter to search for
   * @protected
   */
  protected search(minDate, maxDate) {
    of(
      {
        ...this.getFilterParam(minDate, RANGE_FILTER_MIN_SUFFIX),
        ...this.getFilterParam(maxDate, RANGE_FILTER_MAX_SUFFIX)
      }
    ).pipe(
      withLatestFrom(this.route.queryParams),
      map(([newParams, queryParams]) => Object.assign({}, queryParams, newParams)),
      map(params =>
        Object.keys(params)
          .filter((k) => hasValue(params[k]) && isNotEmpty(params[k]))
          .reduce((a, k) => ({ ...a, [k]: params[k] }), {})
      ),
      switchMap(queryParams => from(this.router.navigate(this.getSearchLinkParts(), { queryParams }))),
      take(1)
    ).subscribe(() => this.filter = '');
  }

  private getFilterParam(date, filterSuffix: string): Params | null {
    return { [this.filterConfig.paramName + filterSuffix]: date };
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy() {
    super.ngOnDestroy();
    if (hasValue(this.sub)) {
      this.sub.unsubscribe();
    }
  }
}
