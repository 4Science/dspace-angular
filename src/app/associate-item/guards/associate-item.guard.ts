import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {AssociateItemModeDataService} from '../../core/associateitem/associateitemmode-data.service';

/**
 * Prevent unauthorized activating and loading of routes
 * @class AuthenticatedGuard
 */
@Injectable()
export class AssociateItemGuard implements CanActivate {

  /**
   * @constructor
   */
  constructor(private router: Router,
    private associateItemModeService: AssociateItemModeDataService) {
  }

  /**
   * True when user is authenticated
   * UrlTree with redirect to login page when user isn't authenticated
   * @method canActivate
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const url = state.url;
    return this.handleEditable(route.params.id, route.params.type, url);
  }

  /**
   * True when user is authenticated
   * UrlTree with redirect to login page when user isn't authenticated
   * @method canActivateChild
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(route, state);
  }

  private handleEditable(itemId: string, mode: string, url: string): Observable<boolean | UrlTree> {
    // redirect to sign in page if user is not authenticated
    return this.associateItemModeService.checkAssociateModeByIdAndType(itemId,mode).pipe(
      map((result) => {
        return result;
      }),
    );
  }
}
