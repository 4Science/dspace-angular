import { AppState } from './app.reducer';
import { universalMetaReducer } from './app.metareducers';
import { StoreActionTypes } from './store.actions';

describe('universalMetaReducer', () => {
  const mockReducer = (state: any, action: any) => state;

  it('should pass state through for unknown action', () => {
    const state = { core: { route: { queryParams: { a: '1' }, params: {} } } };
    const result = universalMetaReducer(mockReducer)(state, { type: 'UNKNOWN' });
    expect(result).toEqual(state);
  });

  describe('REHYDRATE', () => {
    it('should merge payload into state', () => {
      const state = { core: { existing: true } };
      const payload = { core: { route: { queryParams: { f: ['x'] }, params: {} } } };
      const result = universalMetaReducer(mockReducer)(state, {
        type: StoreActionTypes.REHYDRATE,
        payload,
      });
      expect(result.core.existing).toBe(true);
    });

    it('should reset core.route to empty after rehydration', () => {
      const state = { core: { route: { queryParams: { f: ['x'] }, params: { id: '123' } } } };
      const payload = { core: { route: { queryParams: { stale: ['val'] }, params: { stale: 'val' } } } };
      const result = universalMetaReducer(mockReducer)(state, {
        type: StoreActionTypes.REHYDRATE,
        payload,
      });
      expect(result.core.route).toEqual({ queryParams: {}, params: {} });
    });

    it('should not crash when state.core is undefined', () => {
      const state = {};
      const payload = { core: { route: { queryParams: { a: '1' }, params: {} } } };
      const result = universalMetaReducer(mockReducer)(state, {
        type: StoreActionTypes.REHYDRATE,
        payload,
      });
      expect(result).toEqual(payload);
    });

    it('should preserve other core properties when resetting route', () => {
      const state = { core: { route: {}, otherProp: 'keep-me' } };
      const payload = { core: { route: { queryParams: { x: '1' }, params: {} } } };
      const result = universalMetaReducer(mockReducer)(state, {
        type: StoreActionTypes.REHYDRATE,
        payload,
      });
      expect(result.core.otherProp).toBe('keep-me');
      expect(result.core.route).toEqual({ queryParams: {}, params: {} });
    });

    it('should handle REPLAY action (no-op)', () => {
      const state = { core: { route: { queryParams: { a: '1' }, params: {} } } };
      const result = universalMetaReducer(mockReducer)(state, {
        type: StoreActionTypes.REPLAY,
      });
      expect(result).toEqual(state);
    });
  });
});