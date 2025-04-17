import { catchError, map, mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  AuthorizationActionTypes, GetAuthorizationsAction, GetAuthorizationsErrorAction, GetAuthorizationsSuccessAction,
} from './authorization.actions';
import { AuthorizationDataService } from './authorization-data.service';
import { of } from 'rxjs';
import { getRequestIdFromParams } from './authorization-utils';


@Injectable()
export class AuthorizationEffects {

  /**
   * Fetch all site related authorizations
   */

  getAuthorizations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthorizationActionTypes.GET_AUTHORIZATIONS),
      mergeMap((action: GetAuthorizationsAction) =>
        this.authorizationDataService.getAuthorizationForObjects(
          action.payload.uuidList,
          action.payload.type,
          action.payload.featureIDs,
          null,
          action.payload.hrefs,
          true
        ).pipe(
          catchError(() => of(new GetAuthorizationsErrorAction())),
          map((authorizationsMap) => {
            if (authorizationsMap instanceof GetAuthorizationsErrorAction) {
              return authorizationsMap;
            }
            const requestId = getRequestIdFromParams(
              action.payload.type,
              action.payload.uuidList,
              action.payload.featureIDs
            );
            return new GetAuthorizationsSuccessAction(authorizationsMap, requestId);
          })
        )
      )
    )
  );


  constructor(
    private actions$: Actions,
    private authorizationDataService: AuthorizationDataService,
  ) {}

}
