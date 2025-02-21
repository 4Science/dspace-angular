import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  map,
  take,
} from 'rxjs/operators';

import { RootDataService } from '../data';
import { getPageInternalServerErrorRoute } from '../router';

/**
 * A guard that checks if root api endpoint is reachable.
 * If not redirect to 500 error page
 */
export const ServerCheckGuard: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  rootDataService: RootDataService = inject(RootDataService),
  router: Router = inject(Router),
): Observable<boolean | UrlTree> => {
  return rootDataService.checkServerAvailability().pipe(
    take(1),
    map((isAvailable: boolean) => isAvailable ? true : router.parseUrl(getPageInternalServerErrorRoute())),
  );
};
