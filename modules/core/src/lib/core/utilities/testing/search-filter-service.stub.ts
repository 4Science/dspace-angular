import { Params } from '@angular/router';
import {
  Observable,
  of as observableOf,
} from 'rxjs';

import {
  SortDirection,
  SortOptions,
} from '../../cache';
import { PaginationComponentOptions } from '../../shared';
import { SearchFilterConfig } from '../../shared';

/* eslint-disable no-empty,@typescript-eslint/no-empty-function */
/**
 * Stub class of {@link SearchFilterService}
 */
export class SearchFilterServiceStub {

  isFilterActiveWithValue(_paramName: string, _filterValue: string): Observable<boolean> {
    return observableOf(true);
  }

  isFilterActive(_paramName: string): Observable<boolean> {
    return observableOf(true);
  }

  getCurrentScope(): Observable<string> {
    return observableOf(undefined);
  }

  getCurrentQuery(): Observable<string> {
    return observableOf(undefined);
  }

  getCurrentPagination(_pagination: any = {}): Observable<PaginationComponentOptions> {
    return Object.assign(new PaginationComponentOptions());
  }

  getCurrentSort(_defaultSort: SortOptions): Observable<SortOptions> {
    return observableOf(new SortOptions('', SortDirection.ASC));
  }

  getCurrentFilters(): Observable<Params> {
    return observableOf({});
  }

  getCurrentView(): Observable<string> {
    return observableOf(undefined);
  }

  isCollapsed(_filterName: string): Observable<boolean> {
    return observableOf(true);
  }

  getPage(_filterName: string): Observable<number> {
    return observableOf(1);
  }

  collapse(_filterName: string): void {
  }

  expand(_filterName: string): void {
  }

  toggle(_filterName: string): void {
  }

  initializeFilter(_filter: SearchFilterConfig): void {
  }

  decrementPage(_filterName: string): void {
  }

  incrementPage(_filterName: string): void {
  }

  resetPage(_filterName: string): void {
  }

  minimizeAll(): void {
  }

}
