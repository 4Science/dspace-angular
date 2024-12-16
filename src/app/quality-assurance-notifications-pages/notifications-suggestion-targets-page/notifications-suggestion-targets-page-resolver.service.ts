import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';

/**
 * Interface for the route parameters.
 */

export interface AdminNotificationsPublicationClaimPageParams {
  pageId?: string;
  pageSize?: number;
  currentPage?: number;
}

/**
 * This class represents a resolver that retrieve the route data before the route is activated.
 */


export const adminNotificationsPublicationClaimPageResolver: ResolveFn<AdminNotificationsPublicationClaimPageParams> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): AdminNotificationsPublicationClaimPageParams => {
  return {
    pageId: route.queryParams.pageId,
    pageSize: parseInt(route.queryParams.pageSize, 10),
    currentPage: parseInt(route.queryParams.page, 10),
  };
};
