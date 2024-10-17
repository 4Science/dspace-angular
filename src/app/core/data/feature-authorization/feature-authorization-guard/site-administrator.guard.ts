import { Injectable } from '@angular/core';
import { SingleFeatureAuthorizationGuard } from './single-feature-authorization.guard';
import { FeatureID } from '../feature-id';
import { AuthorizationDataService } from '../authorization-data.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of as observableOf } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { SiteAuthorizationService } from '../site-authorization.service';

/**
 * Prevent unauthorized activating and loading of routes when the current authenticated user doesn't have administrator
 * rights to the {@link Site}
 */
@Injectable({
  providedIn: 'root'
})
export class SiteAdministratorGuard extends SingleFeatureAuthorizationGuard {
  constructor(
    protected authorizationService: AuthorizationDataService,
    protected siteAuthorizationService: SiteAuthorizationService,
    protected router: Router,
    protected authService: AuthService,
  ) {
    super(authorizationService, router, authService);
  }

  /**
   * Check administrator authorization rights
   */
  getFeatureID(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FeatureID> {
    return observableOf(FeatureID.AdministratorOf);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.siteAuthorizationService.getSiteAuthorization(FeatureID.AdministratorOf);
  }
}
