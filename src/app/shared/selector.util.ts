import { hasValue } from '@dspace/shared/utils';
import {
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';

/**
 * Export a function to return a subset of the state by key
 */
export function keySelector<T, V>(parentSelector, subState: string, key: string): MemoizedSelector<T, V> {
  return createSelector(parentSelector, (state: T) => {
    if (hasValue(state) && hasValue(state[subState])) {
      return state[subState][key];
    } else {
      return undefined;
    }
  });
}
/**
 * Export a function to return a subset of the state
 */
export function subStateSelector<T, V>(parentSelector, subState: string): MemoizedSelector<T, V> {
  return createSelector(parentSelector, (state: T) => {
    if (hasValue(state) && hasValue(state[subState])) {
      return state[subState];
    } else {
      return undefined;
    }
  });
}
