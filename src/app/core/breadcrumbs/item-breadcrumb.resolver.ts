import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';

import {
  APP_CONFIG,
  AppConfig,
} from '../config/app-config.interface';
import { FollowLinkConfig } from '../data/follow-link-config.model';
import { ItemDataService } from '../data/item-data.service';
import { DSpaceObject } from '../shared/dspace-object.model';
import { Item } from '../shared/item.model';
import { getItemPageLinksToFollow } from '../shared/resolvers/item.resolver';
import { BreadcrumbConfig } from './breadcrumb-config.model';
import { DSOBreadcrumbResolver } from './dso-breadcrumb.resolver';
import { DSOBreadcrumbsService } from './dso-breadcrumbs.service';

/**
 * The resolve function that resolves the BreadcrumbConfig object for an Item
 */
export const itemBreadcrumbResolver: ResolveFn<BreadcrumbConfig<Item>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  breadcrumbService: DSOBreadcrumbsService = inject(DSOBreadcrumbsService),
  dataService: ItemDataService = inject(ItemDataService),
  appConfig: AppConfig = inject(APP_CONFIG),
): Observable<BreadcrumbConfig<Item>> => {
  const linksToFollow: FollowLinkConfig<DSpaceObject>[] = getItemPageLinksToFollow(appConfig.item.showAccessStatuses) as FollowLinkConfig<DSpaceObject>[];
  return DSOBreadcrumbResolver(
    route,
    state,
    breadcrumbService,
    dataService,
    ...linksToFollow,
  ) as Observable<BreadcrumbConfig<Item>>;
};
