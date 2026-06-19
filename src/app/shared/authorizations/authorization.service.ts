import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { createFeatureSelector, createSelector, select, Store } from '@ngrx/store';

import { distinctUntilChanged, filter, find, map, switchMap, take } from 'rxjs/operators';
import { AuthorizationsState, ObjectAuthorizationsState } from "src/app/shared/authorizations/authorization.interfaces";
import { SiteDataService } from "../../core/data/site-data.service";
import { AppState } from "../../app.reducer";
import { FeatureID } from "../../core/data/feature-authorization/feature-id";
import { GetAuthorizationsAction } from "./authorization.actions";
import { Site } from "../../core/shared/site.model";
import { hasValue } from "../empty.util";

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

  hasAuthorizationEntryForObject(objectUrl: string): Observable<boolean> {
    return this.getAllAuthorizationsState().pipe(
      map(state => {
        if (hasValue(state)) {
          return hasValue(state[objectUrl])
        }
        return false;
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
