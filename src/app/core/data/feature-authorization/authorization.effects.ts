import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  AuthorizationActionTypes, GetAuthorizationsAction, GetAuthorizationsErrorAction, GetAuthorizationsSuccessAction,
} from './authorization.actions';
import { AuthorizationDataService } from './authorization-data.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.reducer';
import { combineLatest, of } from "rxjs";


@Injectable()
export class AuthorizationEffects {

  /**
   * Fetch all site related authorizations
   */

  getAuthorizations$ = createEffect(() => this.actions$
    .pipe(ofType(AuthorizationActionTypes.GET_AUTHORIZATIONS),
      switchMap((action: GetAuthorizationsAction) => combineLatest([
        this.authorizationDataService.getAuthorizationForObjects(action.payload.uuidList, action.payload.type, action.payload.featureIDs).pipe(
          catchError((error) => {
            this.store.dispatch(new GetAuthorizationsErrorAction(action.payload.uuidList, action.payload.featureIDs));
            throw error;
          })
        ),
        of(action.payload)
      ])),
      map(([authorizationsMap, payload]) => new GetAuthorizationsSuccessAction(authorizationsMap, payload.uuidList))
    ));


  constructor(
    private actions$: Actions,
    private authorizationDataService: AuthorizationDataService,
    private store: Store<AppState>
  ) {}

}
