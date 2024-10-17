import { Injectable } from '@angular/core';
import { FeatureID } from '../feature-id';
import { AuthorizationDataService } from '../authorization-data.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { SomeFeatureAuthorizationGuard } from './some-feature-authorization.guard';
import { SiteAuthorizationService } from '../site-authorization.service';
import { map } from 'rxjs/operators';

/**
 * Prevent unauthorized activating and loading of routes when the current authenticated user doesn't have administrator
 * rights to the {@link Site}, Community or Collection
 */
@Injectable({
  providedIn: 'root'
})
export class GenericAdministratorGuard extends SomeFeatureAuthorizationGuard {
  constructor(
    protected authorizationService: AuthorizationDataService,
    protected siteAuthorizationService: SiteAuthorizationService,
    protected router: Router,
    protected authService: AuthService
  ) {
    super(authorizationService, router, authService);
  }

  /**
   * Check if user have administrator rights to Site, Community or Collection
   */
  getFeatureIDs(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FeatureID[]> {
    return  observableOf([
      FeatureID.AdministratorOf,
      FeatureID.IsCommunityAdmin,
      FeatureID.IsCollectionAdmin,
    ]);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return combineLatest([
      this.siteAuthorizationService.getSiteAuthorization(FeatureID.AdministratorOf),
      this.siteAuthorizationService.getSiteAuthorization(FeatureID.IsCommunityAdmin),
      this.siteAuthorizationService.getSiteAuthorization(FeatureID.IsCollectionAdmin),
    ]).pipe(
      map(([isAdmin, isCommAdmin, isCollAdmin]) => isAdmin || isCollAdmin || isCommAdmin)
    );
  }
}
