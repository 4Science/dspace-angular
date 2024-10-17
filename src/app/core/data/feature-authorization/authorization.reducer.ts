import { AuthorizationAction, AuthorizationActionTypes } from './authorization.actions';
import { AuthorizationsState } from './authorization-config.interfaces';


const initialState = Object.create(null);

export function authorizationReducer(storeState = initialState, action: AuthorizationAction): AuthorizationsState {
  switch (action.type) {

    case AuthorizationActionTypes.CONFIGURE_SITE_AUTHORIZATIONS: {
      return configureSiteAuthorizations(storeState, action as AuthorizationAction);
    }


    default: {
      return storeState;
    }
  }
}

function configureSiteAuthorizations(storeState: AuthorizationsState, action: AuthorizationAction): AuthorizationsState {
  return Object.assign({}, storeState, {
    siteAuthorizations: Object.assign({}, storeState.siteAuthorizations, action.payload)
  });

}
