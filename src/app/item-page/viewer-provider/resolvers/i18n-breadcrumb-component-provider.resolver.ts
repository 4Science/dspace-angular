import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';

import { BreadcrumbConfig } from '../../../breadcrumbs/breadcrumb/breadcrumb-config.model';
import { i18nBreadcrumbResolver } from '../../../core/breadcrumbs/i18n-breadcrumb.resolver';
import { I18nBreadcrumbsService } from '../../../core/breadcrumbs/i18n-breadcrumbs.service';

/**
 * Function for resolving an I18n breadcrumb configuration object
 * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
 * @param {RouterStateSnapshot} state The current RouterStateSnapshot
 * @returns BreadcrumbConfig<string> object
 */
export const i18nBreadcrumbComponentProviderResolver: ResolveFn<BreadcrumbConfig<string>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): BreadcrumbConfig<string> => {
  const breadcrumbService = inject(I18nBreadcrumbsService);
  const resolver = (activatedRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot) => i18nBreadcrumbResolver(activatedRouteSnapshot, routerStateSnapshot);

  const getKey = (snapshot: ActivatedRouteSnapshot): string => {
    return (snapshot.data.custom_params || [])
      .filter(Object)
      .map(param => snapshot.params[param])
      .filter(Object)
      .reduce((acc, curr) => `${acc}.${curr}`, (resolver(snapshot, state) as BreadcrumbConfig<string>).key);
  };

  return resolver(route, state) as BreadcrumbConfig<string>;
};
