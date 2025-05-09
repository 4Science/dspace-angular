import { Injectable } from '@angular/core';
import {
  createSelector,
  select,
  Store,
} from '@ngrx/store';
import {
  combineLatest as observableCombineLatest,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState } from '../../app.reducer';
import { HostWindowService } from '../host-window.service';
import {
  SidebarCollapseAction,
  SidebarExpandAction,
  SidebarToggleAction,
} from './sidebar.actions';
import { SidebarState } from './sidebar.reducer';

const sidebarStateSelector = (state: AppState) => state.sidebar;
const sidebarCollapsedSelector = createSelector(sidebarStateSelector, (sidebar: SidebarState) => sidebar.sidebarCollapsed);

/**
 * Service that performs all actions that have to do with the sidebar
 */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  /**
   * Emits true is the current screen size is mobile
   */
  private isXsOrSm$: Observable<boolean>;

  /**
   * Emits true is the sidebar's state in the store is currently collapsed
   */
  private isCollapsedInStore: Observable<boolean>;

  constructor(private store: Store<AppState>, private windowService: HostWindowService) {
    this.isXsOrSm$ = this.windowService.isXsOrSm();
    this.isCollapsedInStore = this.store.pipe(select(sidebarCollapsedSelector));
  }

  /**
   * Checks if the sidebar should currently be collapsed
   * @returns {Observable<boolean>} Emits true if the user's screen size is mobile or when the state in the store is currently collapsed
   */
  get isCollapsed(): Observable<boolean> {
    return observableCombineLatest([
      this.isXsOrSm$,
      this.isCollapsedInStore,
    ]).pipe(
      map(([mobile, store]) => mobile && store),
    );
  }

  /**
   * Checks if the sidebar should currently be collapsed on large screens
   * @returns {Observable<boolean>} Emits true when the state in the store is currently collapsed,
   * regardless of the screen size
   */
  get isCollapsedInXL(): Observable<boolean> {
    return this.isCollapsedInStore;
  }

  /**
   * Dispatches a collapse action to the store
   */
  public collapse(): void {
    this.store.dispatch(new SidebarCollapseAction());
  }

  /**
   * Dispatches an expand action to the store
   */
  public expand(): void {
    this.store.dispatch(new SidebarExpandAction());
  }

  /**
   * Dispatches an toggle action to the store
   */
  public toggle(): void {
    this.store.dispatch(new SidebarToggleAction());
  }
}
