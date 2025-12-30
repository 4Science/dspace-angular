import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

import { Item } from '../../../../core/shared/item.model';
import { AppState } from '../../../../app.reducer';
import { getPendingStatus } from '../../../../associate-item/associate-item.selectors';
import { hasValue } from '../../../empty.util';
import { ManageAssociationCustomData, ManageAssociationEvent, ManageAssociationEventType } from '../../../../associate-item/associate-item-page.component';

@Component({
  selector: 'ds-associate-items-actions',
  templateUrl: './associate-items-actions.component.html',
  styleUrls: ['./associate-items-actions.component.scss']
})
export class AssociateItemsActionsComponent implements OnInit, OnDestroy {

  /**
   * The Item object
   */
  @Input() object: Item;

  /**
   * Pass custom data to the component for custom utilization
   */
  @Input() customData: ManageAssociationCustomData;
  /**
   * consider thumbnails if required by configuration
   */
  @Input() showThumbnails: boolean;

  /**
   * If this item is already associated with the targetitem
   */
  isAssociated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  /**
   * The subscription list to be unsubscribed
   */
  subs: Subscription[] = [];

  /**
   * Representing if a association action is processing
   */
  isProcessingAssociation: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Representing if a disassociation action is processing
   */
  isProcessingDisAssociation: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Representing if any action is processing in the page result list
   */
  pendingChanges$: Observable<boolean>;

  /**
   * Emit when one of the listed object has changed.
   */
  @Output() processCompleted = new EventEmitter<ManageAssociationEvent>();

  constructor(
    protected store: Store<AppState>,
  ) {
  }

  /**
   * Subscribe to the relationships list
   */
  ngOnInit(): void {
    this.pendingChanges$ = this.store.pipe(
      select(getPendingStatus),
      map(pendingChanges =>
        pendingChanges ||
        this.isProcessingAssociation.value ||
        this.isProcessingDisAssociation.value
      )
    );

    if (!!this.customData) {
      if (!!this.customData.metadatafield && !!this.customData.targetid) {
          if (this.object.hasMetadata(this.customData.metadatafield)) {
            if (this.object.allMetadata(this.customData.metadatafield).filter(value => (value.authority &&  value.authority === this.customData.targetid))
              .length > 0) {
              this.isAssociated.next(true);
            }
          }
      }
      if (!!this.customData.updateStatusByItemId$) {
        this.subs.push(
          this.customData.updateStatusByItemId$.subscribe((itemId?: string) => {
            if (itemId && this.object.id === itemId) {
              // Simple Workaround based on current operation. More elegant would be to reload the item and check, if the metadata exist
              if (this.isProcessingAssociation.value) {
                this.isAssociated.next(true);
              } else if (this.isProcessingDisAssociation.value) {
                this.isAssociated.next(false);
              }
              this.isProcessingAssociation.next(false);
              this.isProcessingDisAssociation.next(false);
            }
          })
        );
      }
    }
  }

  /**
   * When a button is clicked emit the event in the parent components
   */
  emitAction(action): void {
    this.setProcessing(action);
    this.processCompleted.emit({ action, item: this.object });
  }

  private setProcessing(action: ManageAssociationEventType): void {
    switch (action) {
      case ManageAssociationEventType.associate:
        this.isProcessingAssociation.next(true);
        break;
      case ManageAssociationEventType.disassociate:
        this.isProcessingDisAssociation.next(true);
        break;
    }
  }

  /**
   * On destroy unsubscribe
   */
  ngOnDestroy(): void {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }

}
