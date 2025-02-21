import {
  BehaviorSubject,
  Observable,
  of as observableOf,
} from 'rxjs';

import { PaginatedSearchOptions } from '../../shared';
import { AppliedFilter } from '../../shared';
import { SearchFilterConfig } from '../../shared';
import { ViewMode } from '../../shared';

/**
 * Stub class of {@link SearchService}
 */
export class SearchServiceStub {

  private _viewMode: ViewMode;
  private subject?: BehaviorSubject<any> = new BehaviorSubject(this.testViewMode);

  viewMode = this.subject.asObservable();

  constructor(private searchLink: string = '/search') {
    this.setViewMode(ViewMode.ListElement);
  }

  getSelectedValuesForFilter(_filterName: string): Observable<AppliedFilter[]> {
    return observableOf([]);
  }

  getViewMode(): Observable<ViewMode> {
    return this.viewMode;
  }

  setViewMode(viewMode: ViewMode) {
    this.testViewMode = viewMode;
  }

  getFacetValuesFor(_filterConfig: SearchFilterConfig, _valuePage: number, _searchOptions?: PaginatedSearchOptions, _filterQuery?: string, _useCachedVersionIfAvailable = true) {
    return null;
  }

  get testViewMode(): ViewMode {
    return this._viewMode;
  }

  set testViewMode(viewMode: ViewMode) {
    this._viewMode = viewMode;
    this.subject.next(viewMode);
  }

  getSearchLink() {
    return this.searchLink;
  }

  getFilterLabels() {
    return observableOf([]);
  }

  search() {
    return observableOf({});
  }
}
