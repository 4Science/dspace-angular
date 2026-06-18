import { Params } from '@angular/router';

import {
  AddParameterAction,
  AddQueryParameterAction,
  ResetRouteStateAction,
  SetParameterAction,
  SetParametersAction,
  SetQueryParameterAction,
  SetQueryParametersAction,
} from './route.actions';
import { routeReducer, RouteState } from './route.reducer';

describe('routeReducer', () => {
  const initialState: RouteState = {
    queryParams: {},
    params: {},
  };

  it('should return initial state for unknown action', () => {
    const state = routeReducer(undefined, { type: 'UNKNOWN' } as any);
    expect(state).toEqual(initialState);
  });

  describe('RESET', () => {
    it('should reset state to initialState', () => {
      const state: RouteState = {
        queryParams: { f: { author: ['Smith'] } },
        params: { id: '123', configuration: 'default' },
      };
      const result = routeReducer(state, new ResetRouteStateAction());
      expect(result).toEqual(initialState);
    });
  });

  describe('SET_PARAMETERS', () => {
    it('should replace all params with action payload', () => {
      const state: RouteState = { ...initialState };
      const payload: Params = { id: '123', configuration: 'default' };
      const result = routeReducer(state, new SetParametersAction(payload));
      expect(result.params).toEqual(payload);
      expect(result.queryParams).toEqual(state.queryParams);
    });

    it('should clear params when payload is empty', () => {
      const state: RouteState = {
        queryParams: {},
        params: { id: '123' },
      };
      const result = routeReducer(state, new SetParametersAction({}));
      expect(result.params).toEqual({});
      expect(result.queryParams).toEqual(state.queryParams);
    });
  });

  describe('SET_QUERY_PARAMETERS', () => {
    it('should replace all queryParams with action payload', () => {
      const state: RouteState = { ...initialState };
      const payload: Params = { 'f.author': ['Smith'], 'spc.page': '1' };
      const result = routeReducer(state, new SetQueryParametersAction(payload));
      expect(result.queryParams).toEqual(payload);
      expect(result.params).toEqual(state.params);
    });

    it('should clear queryParams when payload is empty', () => {
      const state: RouteState = {
        queryParams: { 'f.author': ['Smith'] },
        params: {},
      };
      const result = routeReducer(state, new SetQueryParametersAction({}));
      expect(result.queryParams).toEqual({});
      expect(result.params).toEqual(state.params);
    });
  });

  describe('SET_PARAMETER', () => {
    it('should set a single param key-value pair', () => {
      const state: RouteState = {
        queryParams: {},
        params: { id: '123' },
      };
      const result = routeReducer(state, new SetParameterAction('configuration', 'default'));
      expect(result.params).toEqual({ id: '123', configuration: 'default' });
    });
  });

  describe('SET_QUERY_PARAMETER', () => {
    it('should set a single query param key-value pair', () => {
      const state: RouteState = {
        queryParams: { 'f.author': ['Smith'] },
        params: {},
      };
      const result = routeReducer(state, new SetQueryParameterAction('tab', 'publications'));
      expect(result.queryParams).toEqual({ 'f.author': ['Smith'], tab: 'publications' });
    });
  });

  describe('ADD_PARAMETER', () => {
    it('should append value to existing param key', () => {
      const state: RouteState = {
        queryParams: {},
        params: { tag: ['a'] },
      };
      const result = routeReducer(state, new AddParameterAction('tag', 'b'));
      expect(result.params.tag).toEqual(['a', 'b']);
    });

    it('should create new param key with value array when key does not exist', () => {
      const state: RouteState = { ...initialState };
      const result = routeReducer(state, new AddParameterAction('tag', 'new'));
      expect(result.params.tag).toEqual(['new']);
    });
  });

  describe('ADD_QUERY_PARAMETER', () => {
    it('should append value to existing query param key', () => {
      const state: RouteState = {
        queryParams: { 'f.author': ['Smith'] },
        params: {},
      };
      const result = routeReducer(state, new AddQueryParameterAction('f.author', 'Jones'));
      expect(result.queryParams['f.author']).toEqual(['Smith', 'Jones']);
    });

    it('should create new query param key with value array when key does not exist', () => {
      const state: RouteState = { ...initialState };
      const result = routeReducer(state, new AddQueryParameterAction('tag', 'new'));
      expect(result.queryParams.tag).toEqual(['new']);
    });
  });
});
