import { getRequestIdFromParams } from 'src/app/core/data/feature-authorization/authorization-utils';

import {
  AuthorizationAction,
  AuthorizationActionTypes,
  GetAuthorizationsAction,
  GetAuthorizationsErrorAction,
  GetAuthorizationsSuccessAction,
} from './authorization.actions';
import { AuthorizationsState } from './authorization.interfaces';


const initialState = Object.create({
  authorizations: {},
  loading: true,
  hasError: false,
  pendingRequests: [],
});

export function authorizationReducer(storeState = initialState, action: AuthorizationAction): AuthorizationsState {
  switch (action.type) {


    case AuthorizationActionTypes.GET_AUTHORIZATIONS: {
      return setAuthorizationsLoading(storeState, action as GetAuthorizationsAction);
    }

    case AuthorizationActionTypes.GET_AUTHORIZATIONS_SUCCESS: {
      return setAuthorizationsSuccess(storeState, action as GetAuthorizationsSuccessAction);
    }

    case AuthorizationActionTypes.GET_AUTHORIZATIONS_ERROR: {
      return setAuthorizationsError(storeState, action as GetAuthorizationsErrorAction);
    }

    default: {
      return storeState;
    }
  }
}

function setAuthorizationsError(storeState: AuthorizationsState, action: GetAuthorizationsErrorAction): AuthorizationsState {
  return Object.assign({}, storeState, {
    hasError: true,
    loading: false,
    pendingRequests: [],
  });
}

function setAuthorizationsLoading(storeState: AuthorizationsState, action: GetAuthorizationsAction): AuthorizationsState {
  const requestId = getRequestIdFromParams(action.payload.type, action.payload.uuidList, action.payload.featureIDs);
  return Object.assign({}, storeState, {
    loading: true,
    pendingRequests: [...new Set([...storeState.pendingRequests, requestId])],
  });
}


function setAuthorizationsSuccess(storeState: AuthorizationsState, action: GetAuthorizationsSuccessAction): AuthorizationsState {
  const newAuthorizationsState = Object.assign({}, storeState.authorizations ?? {});
  const objectsEntries = Object.keys(action.payload.authorizations);

  objectsEntries.forEach(entry => {
    newAuthorizationsState[entry] = { ...newAuthorizationsState[entry], ...action.payload.authorizations[entry] };
  });
  const pendingRequests = [...storeState.pendingRequests];
  const resolvedRequestIndex = pendingRequests.findIndex(value => value === action.payload.resolvedRequestId);
  if (resolvedRequestIndex >= 0) {
    pendingRequests.splice(pendingRequests.indexOf(action.payload.resolvedRequestId), 1);
  }
  return Object.assign({}, storeState, {
    authorizations: newAuthorizationsState,
    loading: false,
    pendingRequests,
    resolvedRequestId: null,
  });
}
