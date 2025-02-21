import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';

import { BitstreamDataService } from '../../data';
import {
  followLink,
  FollowLinkConfig,
} from '../../data';
import { RemoteData } from '../../data';
import { Bitstream } from '../bitstream.model';
import { getFirstCompletedRemoteData } from '../operators';

/**
 * The self links defined in this list are expected to be requested somewhere in the near future
 * Requesting them as embeds will limit the number of requests
 */
export const BITSTREAM_PAGE_LINKS_TO_FOLLOW: FollowLinkConfig<Bitstream>[] = [
  followLink('bundle', {}, followLink('primaryBitstream'), followLink('item')),
  followLink('format'),
];

/**
 * Method for resolving a bitstream based on the parameters in the current route
 * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
 * @param {RouterStateSnapshot} state The current RouterStateSnapshot
 * @param {BitstreamDataService} bitstreamService
 * @returns Observable<<RemoteData<Item>> Emits the found bitstream based on the parameters in the current route,
 * or an error if something went wrong
 */
export const bitstreamPageResolver: ResolveFn<RemoteData<Bitstream>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  bitstreamService: BitstreamDataService = inject(BitstreamDataService),
): Observable<RemoteData<Bitstream>> => {
  return bitstreamService.findById(route.params.id, true, false, ...BITSTREAM_PAGE_LINKS_TO_FOLLOW)
    .pipe(
      getFirstCompletedRemoteData(),
    );
};
