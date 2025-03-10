import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { BehaviorSubject, EMPTY, Observable, Subscription, } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';

import { hasValue } from '../shared/empty.util';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteData,
  getRemoteDataPayload
} from '../core/shared/operators';
import { RemoteData } from '../core/data/remote-data';
import { Item } from '../core/shared/item.model';
import { EntityTypeDataService } from '../core/data/entity-type-data.service';
import { Context } from '../core/shared/context.model';
import { HostWindowService } from '../shared/host-window.service';
import { getItemPageRoute } from '../item-page/item-page-routing-paths';
import { AppState } from '../app.reducer';
import { AssociateItemActionTypes } from './associate-item.actions';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { AssociateItemModeDataService } from '../core/associateitem/associateitemmode-data.service';
import { AssociateItemMode } from '../core/associateitem/models/associateitem-mode.model';
import { AssociateItemService } from '../core/associateitem/associateitem.service';
import { ViewMode } from '../core/shared/view-mode.model';
import {ConfigurationSearchPageComponent} from '../search-page/configuration-search-page.component';
import {currentPath} from '../shared/utils/route.utils';
import {SearchService} from '../core/shared/search/search.service';

export enum ManageAssociationEventType {
  associate = 'associate',
  disassociate = 'disassociate',
}

export interface ManageAssociationEvent {
  action: ManageAssociationEventType;
  item: Item;
}

export interface ManageAssociationCustomData {
  metadatafield: string;
  updateStatusByItemId$: BehaviorSubject<string>;
  targetid: string;
}

@Component({
  selector: 'ds-associate-item-page',
  templateUrl: './associate-item-page.component.html',
  styleUrls: ['./associate-item-page.component.scss'],
})
/**
 * Component for displaying the introduction text and search results to associate items with each other
 * */
export class AssociateItemPageComponent implements OnInit, OnDestroy {

  @ViewChild(ConfigurationSearchPageComponent) search: ConfigurationSearchPageComponent;

  /**
   * A boolean representing if component is active
   * @type {boolean}
   */
  isActive: boolean;

  inPlaceSearch = true;

  /**
   * Item as observable Remote Data
   */
  itemRD$: Observable<RemoteData<Item>>;

  /**
   * Item that is being checked for relationships
   */
  item: Item;

  /**
   * The associate mode from the path
   */
  routemode: string;

  /**
   * The resolved mode
   */
  mode: AssociateItemMode;

  /**
   * The resolved mode
   */
  mode$: Observable<AssociateItemMode>;
  /**
   * The discovery configuration
   */
  configuration: string;
  /**
   * The metadatafield for the associated item
   */
  metadatafield: string;

  /**
   * The current context of this page: associateItem
   */
  context: Context = Context.AssociateItem;

  /**
   * The emitter that updates the state of the items.
   * If null or undefined then updates all items in the view.
   */
  updateStatusByItemId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  /**
   * The relationship configuration
   */
  searchFilter: string;

  /**
   * Emits true if were on a small screen
   */
  isXsOrSm$: Observable<boolean>;

  /**
   * Description Text for the Page
   */
  description: string;

  /**
   * Emits true when a relationship is being added, deleted, or updated
   */
  private processing$ = new BehaviorSubject<boolean>(false);

  /**
   * Representing if any action is processing in the page result list
   */
  pendingChanges$: Observable<boolean>;

  /**
   * Available View Modes
   */
  viewModes: ViewMode[] = [ViewMode.ListElement];

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   */
  private subs: Subscription[] = [];

  constructor(private route: ActivatedRoute,
              private router: Router,
              protected entityTypeService: EntityTypeDataService,
              private windowService: HostWindowService,
              private translate: TranslateService,
              private title: Title,
              protected store: Store<AppState>,
              protected notification: NotificationsService,
              protected associateItemModeDataService: AssociateItemModeDataService,
              protected associateItemService: AssociateItemService,
              private searchService: SearchService,
  ) {
    this.routemode = this.route.snapshot.params.type;
    this.isXsOrSm$ = this.windowService.isXsOrSm();
    this.description = this.translate.instant('associate.item.' + this.routemode + '.description') || '';
  }


  /**
   * On component initialization get the item object.
   * After getting object get all its relationships & relationsihp types
   * Get all results of the relation to manage
   */
  ngOnInit() {

    this.itemRD$ = this.route.data.pipe(
      map((data) => data.info),
      getFirstSucceededRemoteData()
    ) as Observable<RemoteData<Item>>;

    this.getInfo();
    this.mode$ = this.associateItemModeDataService.getAssociateModeByIdAndType(this.item.id, this.routemode);
    this.mode$.subscribe((value: AssociateItemMode) => {
      this.mode = value;
      this.metadatafield = value.metadatafield;
      this.configuration = value.discovery;
      }
    );

    this.pendingChanges$ = this.processing$.asObservable().pipe(
      tap((res) => {
        this.store.dispatch(AssociateItemActionTypes.PENDING_CHANGES({ pendingChanges: res }));
      })
    );

  }

  /**
   * Get Info about the current object
   * */
  getInfo() {
    this.subs.push(
      this.itemRD$.pipe(
        getRemoteDataPayload(),
        take(1)
      ).subscribe((item: Item) => {
        this.item = item;

        const modeTranslated = this.translate.instant(this.routemode + '.search.results.head');

        this.title.setTitle(modeTranslated);
        this.searchFilter = ``;
        this.isActive = true;
      })
    );
  }

  /**
   * When an action is performed manage the association of the item
   * @param event  the event from which comes an action type
   */
  manageAction(event: ManageAssociationEvent): void {
    if (event.action === ManageAssociationEventType.associate) {
      this.createAssociation(this.routemode, event.item, event, this.item).subscribe();
    } else if (event.action === ManageAssociationEventType.disassociate) {
      this.deleteAssociation(this.routemode, event.item, event, this.item).subscribe();
    } else {
      console.warn(`Unhandled action ${event.action}`);
    }
  }

  /**
   * Create Association using the specific service
   */
  createAssociation(mode: string, objectItem: Item, action: ManageAssociationEvent, targetItem: Item): Observable<any> {
    this.processing$.next(true);
    return this.associateItemService.createAssociation(objectItem.id, targetItem.id, mode).pipe(getFirstSucceededRemoteData()).pipe(
      switchMap((rd: RemoteData<any>) => {
        if (rd.hasSucceeded) {
          this.notification.success(undefined, this.getSuccessMsgByAction(action.action));
          this.processing$.next(false);
          this.updateStatusByItemId$.next(objectItem.id);
          return new Observable<never>();
        } else {
          this.processing$.next(false);
          this.updateStatusByItemId$.next(objectItem.id);
          this.notification.error(undefined, this.getErrMsgByAction(action.action));
          return EMPTY;
        }
      }));
  }

  /**
   * Delete Association using the specific service
   */
  deleteAssociation(mode: string, objectItem: Item, action: ManageAssociationEvent, targetItem: Item): Observable<any> {
    this.processing$.next(true);
    return this.associateItemService.deleteAssociation(objectItem.id, targetItem.id, mode).pipe(getFirstCompletedRemoteData()).pipe(
      switchMap((rd: any) => {
        if (rd.hasSucceeded) {
          this.notification.success(undefined, this.getSuccessMsgByAction(action.action));
          this.processing$.next(false);
          this.updateStatusByItemId$.next(objectItem.id);
          return new Observable<never>();
        } else {
          this.processing$.next(false);
          this.updateStatusByItemId$.next(objectItem.id);
          this.notification.error(undefined, this.getErrMsgByAction(action.action));
          return EMPTY;
        }
      }));
  }

  /**
   * When return button is pressed go to previous location
   */
  public onReturn() {
    this.router.navigateByUrl(getItemPageRoute(this.item));
  }

  public onSearchConnected($event: Event) {
    let q = (this.search.searchConfigService.paginatedSearchOptions as any).value.query || '';
    if (q.includes('-' + this.metadatafield + '_authority:' + this.item.id)) {
      q = q.replace('-' + this.metadatafield + '_authority:' + this.item.id, this.metadatafield + '_authority:' + this.item.id);
    } else if (!q.includes(this.metadatafield + '_authority:' + this.item.id)) {
      q += ' ' + this.metadatafield + '_authority:' + this.item.id;
    }
    q = q.replace(/^ */, '');
    q = q.replace(/ *$/, '');
    q = q.replace(/  +/g, ' ');

    this.updateSearch(q);
    this.search.retrieveResults();
    $event.preventDefault();
  }

  public onSearchnotConnected($event: Event) {
    let q = (this.search.searchConfigService.paginatedSearchOptions as any).value.query || '';
    if (!q.includes('-' + this.metadatafield + '_authority:' + this.item.id) && q.includes(this.metadatafield + '_authority:' + this.item.id)) {
      q = q.replace(this.metadatafield + '_authority:' + this.item.id, '-' + this.metadatafield + '_authority:' + this.item.id);
    } else if (!q.includes('-' + this.metadatafield + '_authority:' + this.item.id)) {
      q += ' -' + this.metadatafield + '_authority:' + this.item.id;
    }
    q = q.replace(/^ */, '');
    q = q.replace(/ *$/, '');
    q = q.replace(/  +/g, ' ');

    this.updateSearch(q);
    this.search.retrieveResults();
    $event.preventDefault();
  }

  public onSearchAll($event: Event) {
    let q = (this.search.searchConfigService.paginatedSearchOptions as any).value.query || '*';
    if (q.includes('-' + this.metadatafield + '_authority:' + this.item.id)) {
      q = q.replace('-' + this.metadatafield + '_authority:' + this.item.id, '');
    } else if (q.includes(this.metadatafield + '_authority:' + this.item.id)) {
      q = q.replace(this.metadatafield + '_authority:' + this.item.id, '');
    }
    if (!q.includes('*')) {
      q += ' *';
    }

    this.updateSearch(q);
    this.search.retrieveResults();
    $event.preventDefault();
  }

  /**
   * Updates the search URL query and jump to page 1
   * @param data Updated parameters
   */
  updateSearch(data: any) {

    this.router.navigate(this.getSearchLinkParts(), {
      queryParams: {
        query: data as string,
        [this.search.paginationId + '.page']: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * @returns {string} The base path to the search page, or the current page when inPlaceSearch is true
   */
  public getSearchLink(): string {
    if (this.inPlaceSearch) {
      return currentPath(this.router);
    }
    return this.searchService.getSearchLink();
  }

  /**
   * @returns {string[]} The base path to the search page, or the current page when inPlaceSearch is true, split in separate pieces
   */
  public getSearchLinkParts(): string[] {
    if (this.inPlaceSearch) {
      return [];
    }
    return this.getSearchLink().split('/');
  }

  /**
   * return the i18n error message label according to the action type
   * @param action
   * @private
   */
  private getErrMsgByAction(action: ManageAssociationEventType): string {
    let label;
    switch (action) {
      case ManageAssociationEventType.associate:
        label = 'manage.associateitem.error.associate';
        break;
      case ManageAssociationEventType.disassociate:
        label = 'manage.associateitem.error.disassociate';
        break;
    }

    return this.translate.instant(label);
  }

  /**
   * return the i18n success message label according to the action type
   * @param action
   * @private
   */
  private getSuccessMsgByAction(action: ManageAssociationEventType): string {
    let label;
    switch (action) {
      case ManageAssociationEventType.associate:
        label = 'manage.associateitem.success.associate';
        break;
      case ManageAssociationEventType.disassociate:
        label = 'manage.associateitem.success.disassociate';
        break;
    }

    return this.translate.instant(label);
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    this.isActive = false;
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

}
