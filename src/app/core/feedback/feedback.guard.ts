import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FeatureID } from '../data/feature-authorization/feature-id';
import { Injectable } from '@angular/core';
import { SiteAuthorizationService } from '../data/feature-authorization/site-authorization.service';

/**
 * An guard for redirecting users to the feedback page if user is authorized
 */
@Injectable()
export class FeedbackGuard implements CanActivate {

  constructor(private siteAuthorizationService: SiteAuthorizationService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.siteAuthorizationService.getSiteAuthorization(FeatureID.CanSendFeedback);
  }

}
