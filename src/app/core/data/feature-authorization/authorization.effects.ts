import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  AuthorizationActionTypes, GetAuthorizationsAction, GetAuthorizationsErrorAction, GetAuthorizationsSuccessAction,
} from './authorization.actions';
import { AuthorizationDataService } from './authorization-data.service';
import { of } from 'rxjs';


@Injectable()
export class AuthorizationEffects {

  /**
   * Fetch all site related authorizations
   */

  getAuthorizations$ = createEffect(() => this.actions$
    .pipe(ofType(AuthorizationActionTypes.GET_AUTHORIZATIONS),
      switchMap((action: GetAuthorizationsAction) =>  this.authorizationDataService.getAuthorizationForObjects(action.payload.uuidList, action.payload.type, action.payload.featureIDs, null, true)),
      catchError(() => of(new GetAuthorizationsErrorAction())),
      map((authorizationsMap) => {
        if (authorizationsMap instanceof GetAuthorizationsErrorAction) {
          return authorizationsMap;
        }
        return new GetAuthorizationsSuccessAction(authorizationsMap);
      })
    ));

  constructor(
    private actions$: Actions,
    private authorizationDataService: AuthorizationDataService,
  ) {}

}
