import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { SignpostingLink } from '../../../core/data/signposting-links.model';
import { Observable, of } from 'rxjs';
import { inject } from '@angular/core';
import { hasValue } from '../../../shared/empty.util';
import { SignpostingDataService } from '../../../core/data/signposting-data.service';

/**
 * Resolver to retrieve signposting links before an eventual redirect of any route guard
 *
 * @param route
 * @param state
 * @param signpostingDataService
 */
export const signpostingLinksResolver: ResolveFn<Observable<SignpostingLink[]>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  signpostingDataService: SignpostingDataService = inject(SignpostingDataService),
): Observable<SignpostingLink[]> => {
  const uuid = route.params.id;
  if (!hasValue(uuid)) {
    return of([]);
  }
  return signpostingDataService.getLinks(uuid);
};
