import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';

import { CollectionDataService } from '../data/collection-data.service';
import {
  followLink,
  FollowLinkConfig,
} from '../data/follow-link-config.model';
import { Collection } from '../shared/collection.model';
import { DSpaceObject } from '../shared/dspace-object.model';
import { BreadcrumbConfig } from './breadcrumb-config.model';
import { DSOBreadcrumbResolver } from './dso-breadcrumb.resolver';
import { DSOBreadcrumbsService } from './dso-breadcrumbs.service';

const COLLECTION_PAGE_LINKS_TO_FOLLOW: FollowLinkConfig<Collection>[] = [
  followLink('parentCommunity', {},
    followLink('parentCommunity'),
  ),
  followLink('logo'),
];

/**
 * The resolve function that resolves the BreadcrumbConfig object for a Collection
 */
export const collectionBreadcrumbResolver: ResolveFn<BreadcrumbConfig<Collection>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  breadcrumbService: DSOBreadcrumbsService = inject(DSOBreadcrumbsService),
  dataService: CollectionDataService = inject(CollectionDataService),
): Observable<BreadcrumbConfig<Collection>> => {
  const linksToFollow: FollowLinkConfig<DSpaceObject>[] = COLLECTION_PAGE_LINKS_TO_FOLLOW as FollowLinkConfig<DSpaceObject>[];
  return DSOBreadcrumbResolver(
    route,
    state,
    breadcrumbService,
    dataService,
    ...linksToFollow,
  ) as Observable<BreadcrumbConfig<Collection>>;
};

