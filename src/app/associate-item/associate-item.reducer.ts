import { AssociateItemActionTypes, AssociateItemState } from './associate-item.actions';
import { createReducer, on } from '@ngrx/store';


export const associateItemReducer = createReducer<AssociateItemState>(
  { pendingChanges: false },

  on(AssociateItemActionTypes.PENDING_CHANGES, (state, action): AssociateItemState => {
    return {
      ...state,
      pendingChanges: action.pendingChanges,
    };
  }),

);

export { AssociateItemState };
