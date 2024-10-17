/* eslint-disable max-classes-per-file */

import { type } from '../../../shared/ngrx/type';
import { Action } from '@ngrx/store';
import { AuthorizationFeaturesMap } from '../../shared/authorization.model';


/**
 * The list of AuthorizationActions type definitions
 */
export const AuthorizationActionTypes = {
  CONFIGURE_SITE_AUTHORIZATIONS: type('dspace/authorizations/CONFIGURE_SITE_AUTHORIZATION'),
};

export abstract class AbstractAuthorizationAction implements Action {
  abstract type: string;
}

export class SiteAuthorizationsConfigureAction extends AbstractAuthorizationAction {
  type = AuthorizationActionTypes.CONFIGURE_SITE_AUTHORIZATIONS;
  payload: AuthorizationFeaturesMap;

  constructor(
    authMap: AuthorizationFeaturesMap
  ) {
    super();
    this.payload = authMap;
  }
}


/**
 * A type to encompass all AuthorizationActions
 */
export type AuthorizationAction
  = SiteAuthorizationsConfigureAction;
