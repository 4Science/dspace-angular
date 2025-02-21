import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '@dspace/core';
import { EpersonRegistrationService } from '@dspace/core';
import { redirectOn4xx } from '@dspace/core';
import { getFirstCompletedRemoteData } from '@dspace/core';

/**
 * A guard responsible for redirecting to 4xx pages upon retrieving a Registration object
 * The guard also adds the resulting RemoteData<Registration> object to the route's data for further usage in components
 * The reason this is a guard and not a resolver, is because it has to run before the EndUserAgreementCookieGuard
 */
export const registrationGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authService: AuthService = inject(AuthService),
  epersonRegistrationService: EpersonRegistrationService = inject(EpersonRegistrationService),
  router: Router = inject(Router),
): Observable<boolean> => {
  const token = route.params.token;
  return epersonRegistrationService.searchByToken(token).pipe(
    getFirstCompletedRemoteData(),
    redirectOn4xx(router, authService),
    map((rd) => {
      route.data = { ...route.data, registration: rd };
      return rd.hasSucceeded;
    }),
  );
};
