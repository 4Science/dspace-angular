/* eslint-disable max-classes-per-file */

import { type } from '../../../shared/ngrx/type';
import { Action } from '@ngrx/store';
import { AuthorizationsMapState } from './authorization-config.interfaces';


/**
 * The list of AuthorizationActions type definitions
 */
export const AuthorizationActionTypes = {
  CONFIGURE_SITE_AUTHORIZATIONS: type('dspace/authorizations/CONFIGURE_SITE_AUTHORIZATION'),
  FETCH_SITE_AUTHORIZATIONS: type('dspace/authorizations/FETCH_SITE_AUTHORIZATION'),
  SET_AUTHORIZATIONS_INITIALIZED: type('dspace/authorizations/SET_AUTHORIZATIONS_INITIALIZED'),
  SET_AUTHORIZATIONS_ERROR: type('dspace/authorizations/SET_AUTHORIZATIONS_ERROR'),
};

export abstract class AbstractAuthorizationAction implements Action {
  abstract type: string;
}

export class SiteAuthorizationsConfigureAction extends AbstractAuthorizationAction {
  type = AuthorizationActionTypes.CONFIGURE_SITE_AUTHORIZATIONS;
  payload: AuthorizationsMapState;

  constructor(
    authMap: AuthorizationsMapState
  ) {
    super();
    this.payload = authMap;
  }
}

export class SiteAuthorizationsInitializedAction extends AbstractAuthorizationAction {
  type = AuthorizationActionTypes.SET_AUTHORIZATIONS_INITIALIZED;
  payload: boolean;

  constructor(
    initialized: boolean
  ) {
    super();
    this.payload = initialized;
  }
}

export class SiteAuthorizationsErrorAction extends AbstractAuthorizationAction {
  type = AuthorizationActionTypes.SET_AUTHORIZATIONS_ERROR;
  payload: boolean;

  constructor(
    error: boolean
  ) {
    super();
    this.payload = error;
  }
}

export class FetchSiteAuthorizationsAction extends AbstractAuthorizationAction {
  type = AuthorizationActionTypes.FETCH_SITE_AUTHORIZATIONS;

  constructor() {
    super();
  }
}


/**
 * A type to encompass all AuthorizationActions
 */
export type AuthorizationAction
  = FetchSiteAuthorizationsAction
  | SiteAuthorizationsConfigureAction
  | SiteAuthorizationsErrorAction
  | SiteAuthorizationsInitializedAction;
