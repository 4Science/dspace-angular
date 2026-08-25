import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AssociateItemState } from './associate-item.actions';

/**
 * Base selector to select the core state from the store
 */
export const associateItemSelector = createFeatureSelector<AssociateItemState>('associateItem');

/**
 * Returns the pending status.
 * @function _getPendingStatus
 * @param {AssociateItemState} state
 * @returns {boolean} reportId
 */
const _getPendingStatus = (state: AssociateItemState) => state.pendingChanges;

/**
 * Returns the pending status.
 * @function getPendingStatus
 * @param {AssociateItemState} state
 * @param {any} props
 * @return {boolean}
 */
export const getPendingStatus = createSelector(associateItemSelector, _getPendingStatus);
