import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';

import { BreadcrumbConfig } from '../../breadcrumbs/breadcrumb/breadcrumb-config.model';
import { getItemPageLinksToFollow } from '../../item-page/item.resolver';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { ItemDataService } from '../data/item-data.service';
import { DSpaceObject } from '../shared/dspace-object.model';
import { Item } from '../shared/item.model';
import { DSOBreadcrumbResolverByUuid } from './dso-breadcrumb.resolver';
import { DSOBreadcrumbsService } from './dso-breadcrumbs.service';

/**
 * The resolve function that resolves the BreadcrumbConfig object for an Item from "Edit all details" page
 */
export const editItemBreadcrumbResolver: ResolveFn<BreadcrumbConfig<Item>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  breadcrumbService: DSOBreadcrumbsService = inject(DSOBreadcrumbsService),
  dataService: ItemDataService = inject(ItemDataService),
): Observable<BreadcrumbConfig<Item>> => {
  const linksToFollow: FollowLinkConfig<DSpaceObject>[] = getItemPageLinksToFollow() as FollowLinkConfig<DSpaceObject>[];
  const itemIdString = route.params.id;
  const itemId = itemIdString?.split(':')[0];
  return DSOBreadcrumbResolverByUuid(
    route,
    state,
    itemId,
    breadcrumbService,
    dataService,
    ...linksToFollow,
  ) as Observable<BreadcrumbConfig<Item>>;
};
