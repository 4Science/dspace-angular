/* eslint-disable max-classes-per-file */

import { type } from '../../../shared/ngrx/type';
import { Action } from '@ngrx/store';
import { FeatureID } from './feature-id';
import {
  AuthorizationActionPayload, AuthorizationsState,
  ObjectAuthorizationsState
} from './authorization.interfaces';


/**
 * The list of AuthorizationActions type definitions
 */
export const AuthorizationActionTypes = {
  GET_AUTHORIZATIONS: type('dspace/authorizations/GET_AUTHORIZATIONS'),
  GET_AUTHORIZATIONS_SUCCESS: type('dspace/authorizations/GET_AUTHORIZATIONS_SUCCESS'),
  GET_AUTHORIZATIONS_ERROR: type('dspace/authorizations/GET_AUTHORIZATIONS_ERROR'),
};

export abstract class AbstractAuthorizationAction implements Action {
  abstract type: string;
}

export class GetAuthorizationsAction extends AbstractAuthorizationAction {
  type = AuthorizationActionTypes.GET_AUTHORIZATIONS;
  payload: AuthorizationActionPayload;

  constructor(
    uuidList: string[],
    uniqueType: string,
    featureIDs: FeatureID[]
  ) {
    super();
    this.payload = {
      uuidList,
      type: uniqueType,
      featureIDs
    };
  }
}

export class GetAuthorizationsSuccessAction extends AbstractAuthorizationAction {
  type = AuthorizationActionTypes.GET_AUTHORIZATIONS_SUCCESS;
  payload: AuthorizationsState;

  constructor(
    map: ObjectAuthorizationsState,
  ) {
    super();
    this.payload = {
      authorizations: map,
      hasError: false,
      loading: false
    };
  }
}

export class GetAuthorizationsErrorAction extends AbstractAuthorizationAction {
  type = AuthorizationActionTypes.GET_AUTHORIZATIONS_ERROR;
  payload: AuthorizationActionPayload;

  constructor(
    uuidList: string[],
    featureIDs: FeatureID[]
  ) {
    super();
    this.payload = {
      uuidList,
      featureIDs
    };
  }
}



/**
 * A type to encompass all AuthorizationActions
 */
export type AuthorizationAction
  = GetAuthorizationsAction
  | GetAuthorizationsSuccessAction
  | GetAuthorizationsErrorAction;
