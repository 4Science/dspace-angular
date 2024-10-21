import { Injectable } from '@angular/core';
import { SiteDataService } from '../site-data.service';
import { Observable, switchMap } from 'rxjs';
import { createFeatureSelector, createSelector, select, Store } from '@ngrx/store';
import { AuthorizationsMapState, AuthorizationsState } from './authorization-config.interfaces';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { AppState } from '../../../app.reducer';
import { FetchSiteAuthorizationsAction } from './authorization.actions';
import { FeatureID } from './feature-id';


const authorizationsSelector = createFeatureSelector<AuthorizationsState>('authorizationFeaturesConfig');

/**
 * The base selector function to select the authorizations for the site
 */
const getAllAuthorizations = createSelector(
  authorizationsSelector,
  (state: AuthorizationsState) =>  state.authorizations
);

/**
 * The selector function to select initialization state
 */
const getInitializationStatus = createSelector(
  authorizationsSelector,
  (state: AuthorizationsState) =>  state.initialized
);

/**
 * A service to retrieve {@link Authorization}s for the site
 */
@Injectable()
export class AuthorizationService {
  constructor(
    private siteService: SiteDataService,
    protected store: Store<AppState>,
  ) {}

  public initialize(): void {
    this.store.dispatch(new FetchSiteAuthorizationsAction());
  }

  public getAllAuthorizationsState(): Observable<AuthorizationsMapState> {
    return this.isInitialized().pipe(
      filter(initialized => initialized),
      switchMap(() => {
        return this.store.pipe(
          select(getAllAuthorizations),
          distinctUntilChanged(),
          take(1),
        );
      })
    );
  }

  public getSiteAuthorization(featureId: FeatureID): Observable<boolean> {
    return this.siteService.find().pipe(
      switchMap((site) => {
        return this.getAllAuthorizationsState().pipe(
          map(state => state[site.uuid][featureId])
        );
      })
    );
  }

  private isInitialized(): Observable<boolean> {
    return this.store.pipe(
      select(getInitializationStatus)
    );
  }

}
