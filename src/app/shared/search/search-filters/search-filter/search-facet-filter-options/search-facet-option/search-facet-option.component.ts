import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  Params,
  Router,
  RouterLink,
} from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PaginationService } from '@dspace/core';
import { FacetValue } from '@dspace/core';
import { SearchFilterConfig } from '@dspace/core';
import { SearchService } from '@dspace/core';
import { SearchConfigurationService } from '@dspace/core';
import { SearchFilterService } from '@dspace/core';
import { LiveRegionService } from '../../../../../../../../modules/core/src/lib/core/services/live-region.service';
import { currentPath } from '../../../../../../../../modules/core/src/lib/core/utilities/route.utils';
import { ShortNumberPipe } from '../../../../../utils/short-number.pipe';
import { getFacetValueForType } from '../../../../../../../../modules/core/src/lib/core/utilities/search.utils';

@Component({
  selector: 'ds-search-facet-option',
  styleUrls: ['./search-facet-option.component.scss'],
  templateUrl: './search-facet-option.component.html',
  standalone: true,
  imports: [RouterLink, AsyncPipe, TranslateModule, ShortNumberPipe],
})

/**
 * Represents a single option in a filter facet
 */
export class SearchFacetOptionComponent implements OnInit {
  /**
   * A single value for this component
   */
  @Input() filterValue: FacetValue;

  /**
   * The filter configuration for this facet option
   */
  @Input() filterConfig: SearchFilterConfig;

  /**
   * True when the search component should show results on the current page
   */
  @Input() inPlaceSearch: boolean;

  /**
   * Emits true when this option should be visible and false when it should be invisible
   */
  isVisible: Observable<boolean>;

  /**
   * UI parameters when this filter is added
   */
  addQueryParams$: Observable<Params>;

  /**
   * Link to the search page
   */
  searchLink: string;

  paginationId: string;

  constructor(protected searchService: SearchService,
              protected filterService: SearchFilterService,
              protected searchConfigService: SearchConfigurationService,
              protected router: Router,
              protected paginationService: PaginationService,
              protected liveRegionService: LiveRegionService,
              private translateService: TranslateService,
  ) {
  }

  /**
   * Initializes all observable instance variables and starts listening to them
   */
  ngOnInit(): void {
    this.paginationId = this.searchConfigService.paginationID;
    this.searchLink = this.getSearchLink();
    this.isVisible = this.isChecked().pipe(map((checked: boolean) => !checked));
    this.addQueryParams$ = this.updateAddParams();
  }

  /**
   * Checks if a value for this filter is currently active
   */
  isChecked(): Observable<boolean> {
    return this.filterService.isFilterActiveWithValue(this.filterConfig.paramName, this.getFacetValue());
  }

  /**
   * @returns {string} The base path to the search page, or the current page when inPlaceSearch is true
   */
  getSearchLink(): string {
    if (this.inPlaceSearch) {
      return currentPath(this.router);
    }
    return this.searchService.getSearchLink();
  }

  /**
   * Calculates the parameters that should change if this {@link filterValue} would be added to the active filters
   */
  updateAddParams(): Observable<Params> {
    return this.searchConfigService.selectNewAppliedFilterParams(this.filterConfig.name, this.getFacetValue());
  }

  /**
   * Retrieve facet value related to facet type
   */
  getFacetValue(): string {
    return getFacetValueForType(this.filterValue, this.filterConfig);
  }

  /**
   * Announces to the screen reader that the page will be reloaded, which filter has been selected
   */
  announceFilter() {
    const message = this.translateService.instant('search-facet-option.update.announcement', { filter: this.filterValue.value });
    this.liveRegionService.addMessage(message);
  }
}
