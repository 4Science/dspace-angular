import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createFeatureSelector, createSelector, select, Store } from '@ngrx/store';
import {
  AuthorizationsState,
  ObjectAuthorizationsState
} from './authorization.interfaces';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { AppState } from '../../../app.reducer';
import { FeatureID } from './feature-id';
import { hasValue } from '../../../shared/empty.util';
import { GetAuthorizationsAction } from './authorization.actions';
import { SiteDataService } from '../site-data.service';
import { Site } from '../../shared/site.model';

export const authorizationsSelector = createFeatureSelector<AuthorizationsState>('authorizationFeatures');


/**
 * A service to retrieve {@link Authorization}s for the site
 */
@Injectable()
export class AuthorizationService {

  /**
   * The base selector function to select the authorizations for the site
   */
  getAllAuthorizations = createSelector(
    authorizationsSelector,
    (state: AuthorizationsState) =>  state.authorizations
  );


  /**
   * The selector function to check if service has errors
   */
  getErrorStatus = createSelector(
    authorizationsSelector,
    (state: AuthorizationsState) =>  state.hasError
  );



  getPendingRequestsStatus = createSelector(
    authorizationsSelector,
    (state: AuthorizationsState) =>  state.pendingRequests
  );

  constructor(
    private siteService: SiteDataService,
    private store: Store<AppState>,
  ) {}


  initStateForObjects(uuidList: string[], type: string, featureIDs: FeatureID[], hrefs: string[]) {
    this.store.dispatch(new GetAuthorizationsAction(uuidList, type, featureIDs, hrefs));
  }

  initStateForSite(featureIDs: FeatureID[]) {
    this.siteService.find().pipe(
      take(1)
    ).subscribe((site: Site) => this.initStateForObjects([site.uuid], site.uniqueType, featureIDs, [site.self]));
  }

  initAnonymousStateForSite() {
    this.siteService.find().pipe(
      take(1)
    ).subscribe((site: Site) => this.initStateForObjects([site.uuid], site.uniqueType, [], [site.self]));
  }


  getAllAuthorizationsState(): Observable<ObjectAuthorizationsState> {
    return this.store.pipe(
      select(this.getAllAuthorizations),
      distinctUntilChanged(),
    );
  }


  getAuthorizationForObject(featureId: FeatureID, objectUrl: string): Observable<boolean> {
    return this.getAllAuthorizationsState().pipe(
      map(state => {
        if (hasValue(state)) {
          return objectUrl && state[objectUrl] ? state[objectUrl][featureId] : undefined;
        }
        return undefined;
      }),
      distinctUntilChanged(),
    );
  }


  hasErrors(): Observable<boolean> {
    return this.store.pipe(
      select(this.getErrorStatus),
      distinctUntilChanged(),
    );
  }


  isRequestLoading(requestId: string): Observable<boolean> {
    return this.store.pipe(
      select(this.getPendingRequestsStatus),
      distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b)),
      map(pendingRequests => pendingRequests.includes(requestId)),
      distinctUntilChanged(),
    );
  }

}
