import { createAction, props } from '@ngrx/store';

export interface AssociateItemState {
  pendingChanges: boolean;
}

export const AssociateItemActionTypes = {
  PENDING_CHANGES: createAction(
    'dspace/associate-item-page/PENDING_CHANGES',
    props<{ pendingChanges: boolean }>()
  ),
};

