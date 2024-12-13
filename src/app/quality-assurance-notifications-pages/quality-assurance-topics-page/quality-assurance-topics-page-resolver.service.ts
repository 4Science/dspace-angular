import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import {
  Observable,
  of,
} from 'rxjs';

/**
 * Interface for the route parameters.
 */
export interface QualityAssuranceTopicsPageParams {
  pageId?: string;
  pageSize?: number;
  currentPage?: number;
}

export const qualityAssuranceTopicsPageResolver: ResolveFn<QualityAssuranceTopicsPageParams> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): QualityAssuranceTopicsPageParams => {
  return {
    pageId: route.queryParams.pageId,
    pageSize: parseInt(route.queryParams.pageSize, 10),
    currentPage: parseInt(route.queryParams.page, 10),
  }
};
