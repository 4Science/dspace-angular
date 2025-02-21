import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { hasNoValue } from '@dspace/shared/utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PAGE_NOT_FOUND_PATH } from '../app-routing-paths';
import { BitstreamDataService } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { HardRedirectService } from '@dspace/core';
import { Bitstream } from '@dspace/core';
import { getFirstCompletedRemoteData } from '@dspace/core';

/**
 * Redirects to a bitstream based on the handle of the item, and the sequence id or the filename of the
 * bitstream. In production mode the status code will also be set the status code to 301 marking it as a permanent URL
 * redirect for bots to the regular bitstream download Page.
 *
 * @returns Either a {@link UrlTree} to the 404 page when the url isn't a valid format or false in order to make the
 * user wait until the {@link HardRedirectService#redirect} was performed
 */
export const legacyBitstreamURLRedirectGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  bitstreamDataService: BitstreamDataService = inject(BitstreamDataService),
  serverHardRedirectService: HardRedirectService = inject(HardRedirectService),
  router: Router = inject(Router),
): Observable<UrlTree | false> => {
  const prefix = route.params.prefix;
  const suffix = route.params.suffix;
  const filename = route.params.filename;
  let sequenceId = route.params.sequence_id;
  if (hasNoValue(sequenceId)) {
    sequenceId = route.queryParams.sequenceId;
  }
  return bitstreamDataService.findByItemHandle(
    `${prefix}/${suffix}`,
    sequenceId,
    filename,
  ).pipe(
    getFirstCompletedRemoteData(),
    map((rd: RemoteData<Bitstream>) => {
      if (rd.hasSucceeded && !rd.hasNoContent) {
        serverHardRedirectService.redirect(new URL(`/bitstreams/${rd.payload.uuid}/download`, serverHardRedirectService.getCurrentOrigin()).href, 301);
        return false;
      } else {
        return router.createUrlTree([PAGE_NOT_FOUND_PATH]);
      }
    }),
  );
};
