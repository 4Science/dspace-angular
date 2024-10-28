import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { createFeatureSelector, createSelector, select, Store } from '@ngrx/store';
import {
  AuthorizationsState,
  ObjectAuthorizationsState
} from './authorization.interfaces';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { AppState } from '../../../app.reducer';
import { FeatureID } from './feature-id';
import { hasValue } from "../../../shared/empty.util";
import { GetAuthorizationsAction } from "./authorization.actions";
import { SiteDataService } from "../site-data.service";


const authorizationsSelector = createFeatureSelector<AuthorizationsState>('authorizationFeatures');

/**
 * The base selector function to select the authorizations for the site
 */
const getAllAuthorizations = createSelector(
  authorizationsSelector,
  (state: AuthorizationsState) =>  state.authorizations
);


/**
 * The selector function to check if service has errors
 */
const getErrorStatus = createSelector(
  authorizationsSelector,
  (state: AuthorizationsState) =>  state.hasError
);


const getLoadingStatus = createSelector(
  authorizationsSelector,
  (state: AuthorizationsState) =>  state.loading
);

const getPendingObjects = createSelector(
  authorizationsSelector,
  (state: AuthorizationsState) =>  state.pendingObjects
);

/**
 * A service to retrieve {@link Authorization}s for the site
 */
@Injectable()
export class AuthorizationService {
  constructor(
    private siteService: SiteDataService,
    private store: Store<AppState>,
  ) {}

  initStateForObjects(uuidList: string[], type: string, featureIDs: FeatureID[]) {
    this.store.dispatch(new GetAuthorizationsAction(uuidList, type, featureIDs))
  }

  initStateForSite(featureIDs: FeatureID[]) {
    this.siteService.find().pipe(
      take(1)
    ).subscribe(site => this.initStateForObjects([site.uuid], site.uniqueType, featureIDs))
  }


  getAllAuthorizationsState(): Observable<ObjectAuthorizationsState> {
    return this.store.pipe(
      select(getAllAuthorizations),
      distinctUntilChanged(),
    );
  }


  getAuthorizationForObject(featureId: FeatureID, objectUrl?: string): Observable<boolean | undefined> {
    return this.getAllAuthorizationsState().pipe(
      map(state => {

        if (hasValue(state)) {
          return objectUrl && state[objectUrl] ? state[objectUrl][featureId] : undefined
        }

        return undefined
      }),
    );
  }


  hasErrors(): Observable<boolean> {
    return this.store.pipe(
      select(getErrorStatus),
      distinctUntilChanged(),
    );
  }

  isLoading(): Observable<boolean> {
    return this.store.pipe(
      select(getLoadingStatus),
      distinctUntilChanged(),
    );
  }

  isObjectAuthorizationLoading(uuid: string): Observable<boolean> {
    return this.store.pipe(
      select(getPendingObjects),
      distinctUntilChanged(),
      map(state => state.includes(uuid)),
    );
  }

}
