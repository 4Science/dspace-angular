import { Injectable } from '@angular/core';
import { AuthorizationDataService } from './authorization-data.service';
import { SiteDataService } from '../site-data.service';
import { Observable, ObservableInput, of, switchMap } from 'rxjs';
import { createFeatureSelector, createSelector, select, Store } from '@ngrx/store';
import { AuthorizationsState } from './authorization-config.interfaces';
import { distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { AppState } from '../../../app.reducer';
import { SiteAuthorizationsConfigureAction } from './authorization.actions';
import { environment } from '../../../../environments/environment';
import { AuthorizationFeaturesMap } from '../../shared/authorization.model';
import { FeatureID } from './feature-id';
import { hasValue } from "../../../shared/empty.util";


const siteAuthorizationsSelector = createFeatureSelector<AuthorizationsState>('siteAuthorizationFeaturesConfig');

/**
 * The base selector function to select the authorizations for the site
 */
const getSiteAuthorizations = createSelector(
  siteAuthorizationsSelector,
  (state: AuthorizationsState) =>  state.siteAuthorizations
);

/**
 * A service to retrieve {@link Authorization}s for the site
 */
@Injectable()
export class SiteAuthorizationService  {
  constructor(
    private authService: AuthorizationDataService,
    private siteService: SiteDataService,
    protected store: Store<AppState>,
  ) {}

  public getAllSiteAuthorizations(): void {
   this.getSiteAuthorizationMap().subscribe((authorizations) => {
      this.store.dispatch(new SiteAuthorizationsConfigureAction(authorizations));
    });
  }

  public getSiteAuthorizationState(): Observable<AuthorizationFeaturesMap> {
    return this.store.pipe(
      select(getSiteAuthorizations),
      distinctUntilChanged(),
      switchMap(this.mapAuthorizationsToFeatures),
      take(1),
    );
  }

  public getSiteAuthorization(featureId: FeatureID): Observable<boolean> {
    return this.store.pipe(
      select(getSiteAuthorizations),
      distinctUntilChanged(),
      switchMap(this.mapAuthorizationsToFeatures),
      take(1),
      map(authMap => authMap[featureId]),
    );
  }

  private getSiteAuthorizationMap(): Observable<AuthorizationFeaturesMap> {
    return this.siteService.find().pipe(
      switchMap((site) => this.authService.getAuthorizationForObjects(
        [site.uuid],
        environment.siteAuthorizationFeaturesConfig
      )),
      take(1)
    )
  }

  /**
   * Function to execute fallback call for site authorizations
   */

  mapAuthorizationsToFeatures = (value): ObservableInput<AuthorizationFeaturesMap> =>
    of(value).pipe(
      switchMap(authMap => {
        if (hasValue(authMap)) {
          return of(authMap)
        } else {
          return this.getSiteAuthorizationMap().pipe(
            tap(authorizations => this.store.dispatch(new SiteAuthorizationsConfigureAction(authorizations)))
          )
        }
      })
    )
}
