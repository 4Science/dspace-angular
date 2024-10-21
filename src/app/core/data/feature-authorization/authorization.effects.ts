import { catchError, map, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  AuthorizationActionTypes,
  SiteAuthorizationsConfigureAction,
  SiteAuthorizationsErrorAction, SiteAuthorizationsInitializedAction
} from './authorization.actions';
import { AuthorizationDataService } from './authorization-data.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.reducer';


@Injectable()
export class AuthorizationEffects {

  /**
   * Fetch all site related authorizations
   */

  fetchSiteAuthorizations = createEffect(() => this.actions$
    .pipe(ofType(AuthorizationActionTypes.FETCH_SITE_AUTHORIZATIONS),
      switchMap(() => this.authorizationDataService.getSiteAuthorizationMap().pipe(
        catchError((error) => {
          this.store.dispatch(new SiteAuthorizationsErrorAction(true));
          throw error;
        })
      )),
      map((authorizationsMap) => new SiteAuthorizationsConfigureAction(authorizationsMap))
    ));


  /**
   * Set initialization state
   */
  setInitialized = createEffect(() => this.actions$
    .pipe(ofType(AuthorizationActionTypes.CONFIGURE_SITE_AUTHORIZATIONS),
      map(() => new SiteAuthorizationsInitializedAction(true))
    ));

  constructor(
    private actions$: Actions,
    private authorizationDataService: AuthorizationDataService,
    private store: Store<AppState>
  ) {}

}
