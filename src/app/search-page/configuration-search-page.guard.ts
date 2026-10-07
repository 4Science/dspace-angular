import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { PAGE_NOT_FOUND_PATH } from '../app-routing-paths';
import { hasNoValue } from '../shared/empty.util';

/**
 * Assemble the correct i18n key for the configuration search page's title depending on the current route's configuration parameter.
 * The format of the key will be "{configuration}.search.title" with:
 * - configuration: The current configuration stored in route.params
 *
 * When the configuration route parameter is missing, the user is redirected to the 404 page.
 * Route parameters are always strings, so this also treats the literal strings `'null'` and `'undefined'`
 * (e.g. when navigating to `/search/null`) as missing values.
 */
export const configurationSearchPageGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean | UrlTree => {
  const router = inject(Router);
  const configuration = route.params.configuration;

  if (hasNoValue(configuration) || configuration === 'null' || configuration === 'undefined') {
    return router.createUrlTree([PAGE_NOT_FOUND_PATH]);
  }

  const newTitle = `${configuration}.search.title`;

  route.data = { title: newTitle };
  return true;
};
