import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';

import { SortOptions } from '../../../core/cache/models/sort-options.model';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { RemoteData } from '../../../core/data/remote-data';
import { Context } from '../../../core/shared/context.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { SearchService } from '../../../core/shared/search/search.service';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { AlertComponent } from '../../alert/alert.component';
import { AlertType } from '../../alert/alert-type';
import {
  fadeIn,
  fadeInOut,
} from '../../animations/fade';
import {
  hasNoValue,
  isNotEmpty,
} from '../../empty.util';
import { ErrorComponent } from '../../error/error.component';
import { CollectionElementLinkType } from '../../object-collection/collection-element-link.type';
import { ObjectCollectionComponent } from '../../object-collection/object-collection.component';
import { ListableObject } from '../../object-collection/shared/listable-object.model';
import { AppliedFilter } from '../models/applied-filter.model';
import { PaginatedSearchOptions } from '../models/paginated-search-options.model';
import { SearchFilter } from '../models/search-filter.model';
import { SearchResult } from '../models/search-result.model';
import { SearchExportCsvComponent } from '../search-export-csv/search-export-csv.component';
import { SearchResultsSkeletonComponent } from './search-results-skeleton/search-results-skeleton.component';

export interface SelectionConfig {
  repeatable: boolean;
  listId: string;
}

@Component({
  selector: 'ds-base-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  animations: [
    fadeIn,
    fadeInOut,
  ],
  standalone: true,
  imports: [
    AsyncPipe,
    ErrorComponent,
    NgIf,
    NgxSkeletonLoaderModule,
    ObjectCollectionComponent,
    RouterLink,
    SearchExportCsvComponent,
    SearchResultsSkeletonComponent,
    TranslateModule,
    AlertComponent,
  ],
})

/**
 * Component that represents all results from a search
 */
export class SearchResultsComponent {
  hasNoValue = hasNoValue;
  /**
   * Currently active filters in url
   */
  activeFilters$: Observable<SearchFilter[]>;

  /**
   * Filter applied to show labels, once populated the activeFilters$ will be loaded
   */
  appliedFilters$: BehaviorSubject<AppliedFilter[]>;

  /**
   * The link type of the listed search results
   */
  @Input() linkType: CollectionElementLinkType;

  /**
   * Contains a notice to show before result list if any
   */
  @Input() searchResultNotice: string = null;

  /**
   * The alert type to use for the notice
   */
  @Input() searchResultNoticeType: AlertType = AlertType.Info;

  /**
   * The actual search result objects
   */
  @Input() searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  /**
   * The current configuration of the search
   */
  @Input() searchConfig: PaginatedSearchOptions;

  /**
   * A boolean representing if show csv export button
   */
  @Input() showCsvExport = false;

  /**
   * Whether to show the badge label or not
   */
  @Input() showLabel: boolean;

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics = true;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails: boolean;

  /**
   * Whether to show if the item is a correction
   */
  @Input() showCorrection = false;

  /**
   * A boolean representing if to show workflow statistics
   */
  @Input() showWorkflowStatistics: boolean;

  /**
   * The current sorting configuration of the search
   */
  @Input() sortConfig: SortOptions;

  /**
   * The current view-mode of the list
   */
  @Input() viewMode: ViewMode;

  /**
   * An optional configuration to filter the result on one type
   */
  @Input() configuration: string;

  /**
   * Whether or not to hide the header of the results
   * Defaults to a visible header
   */
  @Input() disableHeader = false;

  /**
   * A boolean representing if result entries are selectable
   */
  @Input() selectable = false;

  @Input() context: Context;

  /**
   * Option for hiding the pagination detail
   */
  @Input() hidePaginationDetail = false;

  /**
   * The config option used for selection functionality
   */
  @Input() selectionConfig: SelectionConfig = null;

  /**
   * A boolean representing if show search result notice
   */
  @Input() showSearchResultNotice = false;

  /**
   * Emit when one of the listed object has changed.
   */
  @Output() contentChange = new EventEmitter<any>();

  @Output() deselectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  @Output() selectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  /**
   * Emit custom event for listable object custom actions.
   */
  @Output() customEvent = new EventEmitter<any>();

  /**
   * Pass custom data to the component for custom utilization
   */
  @Input() customData: any;

  constructor(
    protected searchConfigService: SearchConfigurationService,
    protected searchService: SearchService,
  ) {
    this.activeFilters$ = this.searchConfigService.getCurrentFilters();
    this.appliedFilters$ = this.searchService.appliedFilters$;
  }

  /**
   * Check if search results are loading
   */
  isLoading(): boolean {
    return !this.showError() && (hasNoValue(this.searchResults) || hasNoValue(this.searchResults.payload) || this.searchResults.isLoading);
  }

  showError(): boolean {
    return this.searchResults?.hasFailed && (!this.searchResults?.errorMessage || this.searchResults?.statusCode !== 400);
  }

  errorMessageLabel(): string {
    return (this.searchResults?.statusCode  === 422) ? 'error.invalid-search-query' : 'error.search-results';
  }

  /**
   * Method to change the given string by surrounding it by quotes if not already present.
   */
  surroundStringWithQuotes(input: string): string {
    let result = input;

    if (isNotEmpty(result) && !(result.startsWith('\"') && result.endsWith('\"'))) {
      result = `"${result}"`;
    }

    return result;
  }

  /**
   * Catch the custom event and emit it again
   * @param $event
   */
  emitCustomEvent($event: any) {
    this.customEvent.emit($event);
  }

}
