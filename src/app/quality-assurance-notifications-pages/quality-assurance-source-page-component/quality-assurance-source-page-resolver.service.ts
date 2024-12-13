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
export interface QualityAssuranceSourcePageParams {
  pageId?: string;
  pageSize?: number;
  currentPage?: number;
}


export const qualityAssuranceSourcePageResolver: ResolveFn<QualityAssuranceSourcePageParams> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): QualityAssuranceSourcePageParams => {
  return {
    pageId: route.queryParams.pageId,
    pageSize: parseInt(route.queryParams.pageSize, 10),
    currentPage: parseInt(route.queryParams.page, 10),
  };
};
