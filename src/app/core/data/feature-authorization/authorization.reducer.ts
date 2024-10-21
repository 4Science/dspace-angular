import {
  AuthorizationAction,
  AuthorizationActionTypes,
  SiteAuthorizationsConfigureAction, SiteAuthorizationsErrorAction, SiteAuthorizationsInitializedAction
} from './authorization.actions';
import { AuthorizationsState } from './authorization-config.interfaces';


const initialState = Object.create(null);

export function authorizationReducer(storeState = initialState, action: AuthorizationAction): AuthorizationsState {
  switch (action.type) {

    case AuthorizationActionTypes.CONFIGURE_SITE_AUTHORIZATIONS: {
      return configureAuthorizations(storeState, action as SiteAuthorizationsConfigureAction);
    }

    case AuthorizationActionTypes.SET_AUTHORIZATIONS_INITIALIZED: {
      return setAuthorizationsInitialized(storeState, action as SiteAuthorizationsInitializedAction);
    }

    case AuthorizationActionTypes.SET_AUTHORIZATIONS_ERROR: {
      return setAuthorizationsError(storeState, action as SiteAuthorizationsErrorAction);
    }


    default: {
      return storeState;
    }
  }
}

function configureAuthorizations(storeState: AuthorizationsState, action: SiteAuthorizationsConfigureAction): AuthorizationsState {
  return Object.assign({}, storeState, {
    authorizations: Object.assign({}, storeState.authorizations, action.payload)
  });
}

function setAuthorizationsError(storeState: AuthorizationsState, action: SiteAuthorizationsErrorAction): AuthorizationsState {
  return Object.assign({}, storeState, {
    hasError: action.payload
  });
}

function setAuthorizationsInitialized(storeState: AuthorizationsState, action: SiteAuthorizationsInitializedAction): AuthorizationsState {
  return Object.assign({}, storeState, {
    initialized: action.payload
  });
}
