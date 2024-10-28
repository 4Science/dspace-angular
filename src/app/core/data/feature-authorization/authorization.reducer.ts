import {
  AuthorizationAction,
  AuthorizationActionTypes,
  GetAuthorizationsAction,
  GetAuthorizationsErrorAction,
  GetAuthorizationsSuccessAction,
  SetPendingAuthorizationAction,
} from './authorization.actions';
import { AuthorizationsState } from './authorization.interfaces';
import { object } from "prop-types";


const initialState = Object.create({
  authorizations: null,
  loading: false,
  hasError: false
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
    loading: false
  });
}

function setAuthorizationsLoading(storeState: AuthorizationsState, action: GetAuthorizationsAction): AuthorizationsState {
  return Object.assign({}, storeState, {
    loading: true,
    pendingObjects: action.payload.uuidList
  });
}


function setAuthorizationsSuccess(storeState: AuthorizationsState, action: GetAuthorizationsSuccessAction): AuthorizationsState {
  let newAuthorizationsState = Object.assign({}, storeState.authorizations ?? {})
  const objectsEntries = Object.keys(action.payload.authorizations);

  objectsEntries.forEach(entry => {
    newAuthorizationsState[entry] = {...newAuthorizationsState[entry], ...action.payload.authorizations[entry]}
  })

  return Object.assign({}, storeState, {
    authorizations: newAuthorizationsState,
    loading: false,
    pendingObjects: storeState.pendingObjects.filter(uuid => !action.payload.pendingObjects.includes(uuid))
  });
}
