import { Injectable } from '@angular/core';
import { AuthorizationDataService } from './authorization-data.service';
import { SiteDataService } from '../site-data.service';
import { Observable, switchMap } from 'rxjs';
import { createFeatureSelector, createSelector, select, Store } from '@ngrx/store';
import { AuthorizationsState } from './authorization-config.interfaces';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { AppState } from '../../../app.reducer';
import { SiteAuthorizationsConfigureAction } from './authorization.actions';
import { environment } from '../../../../environments/environment';
import { AuthorizationFeaturesMap } from '../../shared/authorization.model';
import { FeatureID } from './feature-id';


const siteAuthorizationsSelector = createFeatureSelector<AuthorizationsState>('authorizationFeaturesConfig');

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
    this.siteService.find().pipe(
      switchMap((site) => this.authService.getAuthorizationForObjects(
        [site.uuid],
        environment.authorizationFeaturesConfig.site
      )),
      take(1)
    ).subscribe((authorizations) => {
      this.store.dispatch(new SiteAuthorizationsConfigureAction(authorizations));
    });
  }

  public getSiteAuthorizationState(): Observable<AuthorizationFeaturesMap> {
    return this.store.pipe(
      select(getSiteAuthorizations),
      distinctUntilChanged(),
      filter((data) => !!data),
      take(1),
    );
  }

  public getSiteAuthorization(featureId: FeatureID): Observable<boolean> {
    return this.store.pipe(
      select(getSiteAuthorizations),
      distinctUntilChanged(),
      filter((data) => !!data),
      take(1),
      map(authMap => authMap[featureId])
    );
  }
}
