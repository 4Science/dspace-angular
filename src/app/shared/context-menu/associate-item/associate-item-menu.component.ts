import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { hasValue, isNotEmpty } from '../../empty.util';
import { getAllSucceededRemoteDataPayload, getPaginatedListPayload } from '../../../core/shared/operators';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { NotificationsService } from '../../notifications/notifications.service';
import { ContextMenuEntryType } from '../context-menu-entry-type';
import { AssociateItemMode } from '../../../core/associateitem/models/associateitem-mode.model';
import { AssociateItemModeDataService } from '../../../core/associateitem/associateitemmode-data.service';

/**
 * This component renders a context menu option that provides the links to associate item page.
 */
@Component({
  selector: 'ds-context-menu-associate-item',
  templateUrl: './associate-item-menu.component.html'
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class AssociateItemMenuComponent extends ContextMenuEntryComponent implements OnInit, OnDestroy {

  /**
   * The menu entry type
   */
  public static menuEntryType: ContextMenuEntryType = ContextMenuEntryType.AssociateItem;

  /**
   * A boolean representing if a request operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  public processing$ = new BehaviorSubject<boolean>(false);

  /**
   * Reference to NgbModal
   */
  public modalRef: NgbModalRef;

  /**
   * List of Associate Modes available on this item
   * for the current user
   */
  private associateModes$: BehaviorSubject<AssociateItemMode[]> = new BehaviorSubject<AssociateItemMode[]>([]);

  /**
   * Variable to track subscription and unsubscribe it onDestroy
   */
  private sub: Subscription;


  /**
   * Initialize instance variables
   *
   * @param {DSpaceObject} injectedContextMenuObject
   * @param {DSpaceObjectType} injectedContextMenuObjectType
   * @param notificationServices
   */
  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    private associateItemService: AssociateItemModeDataService,
    public notificationService: NotificationsService
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType, ContextMenuEntryType.AssociateItem);
  }

  ngOnInit(): void {
    this.notificationService.claimedProfile.subscribe(() => {
      this.getData();
    });
  }

  /**
   * Check if associate mode is available
   */
  getAssociateModes(): Observable<AssociateItemMode[]> {
    return this.associateModes$;
  }

  /**
   * Check if associate mode is available
   */
  isEditAvailable(): Observable<boolean> {
    return this.associateModes$.asObservable().pipe(
      map((associateModes) => isNotEmpty(associateModes) && associateModes.length > 0)
    );
  }

  /**
   * Make sure the subscription is unsubscribed from when this component is destroyed
   */
  ngOnDestroy(): void {
    if (hasValue(this.sub)) {
      this.sub.unsubscribe();
    }
  }
  getData(): void {
    this.sub = this.associateItemService.searchAssociateModesById(this.contextMenuObject.id).pipe(
      getAllSucceededRemoteDataPayload(),
      getPaginatedListPayload(),
      startWith([])
    ).subscribe((associateModes: AssociateItemMode[]) => {
      this.associateModes$.next(associateModes);
    });
  }
}
