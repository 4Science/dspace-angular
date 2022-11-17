import { Injectable } from '@angular/core';
import { I18nBreadcrumbResolver } from '../../../core/breadcrumbs/i18n-breadcrumb.resolver';
import { I18nBreadcrumbsService } from '../../../core/breadcrumbs/i18n-breadcrumbs.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BreadcrumbConfig } from '../../../breadcrumbs/breadcrumb/breadcrumb-config.model';

@Injectable()
export class I18nBreadcrumbComponentProviderResolver extends I18nBreadcrumbResolver {
  constructor(protected breadcrumbService: I18nBreadcrumbsService) {
    super(breadcrumbService);
  }

  /**
   * Method for resolving an I18n breadcrumb configuration object
   * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
   * @param {RouterStateSnapshot} state The current RouterStateSnapshot
   * @returns BreadcrumbConfig object
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): BreadcrumbConfig<string> {
    return super.resolve(route, state);
  }

  protected getKey(route: ActivatedRouteSnapshot): string {
    return (route.data.custom_params || [])
      .filter(Object)
      .map(param => route.params[param])
      .filter(Object)
      .reduce((acc, curr) => `${acc}.${curr}`, super.getKey(route));
  }
}
