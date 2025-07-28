import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AppState } from '../../../app.reducer';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { RemoteData } from '../../../core/data/remote-data';
import { ResolvedAction } from '../../../core/resolving/resolver.actions';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import {
  followLink,
  FollowLinkConfig,
} from '../../../shared/utils/follow-link-config.model';

export const BITSTREAM_VIEWER_LINKS_TO_FOLLOW: FollowLinkConfig<Bitstream>[] = [
  followLink('bundle'),
  followLink('format'),
  followLink('thumbnail'),
  //followLink('content'),
];

export const bitstreamViewerProviderResolver: ResolveFn<RemoteData<Bitstream>> =  (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  bitstreamService: BitstreamDataService = inject(BitstreamDataService),
  store: Store<AppState> = inject(Store<AppState>),
): Observable<RemoteData<Bitstream>> => {
  return bitstreamService.findById(route.params.bitstream_id,
    true,
    false,
    ...BITSTREAM_VIEWER_LINKS_TO_FOLLOW,
  ).pipe(
    getFirstCompletedRemoteData(),
    tap((bitstreamRD: RemoteData<Bitstream>) => store.dispatch(new ResolvedAction(state.url, bitstreamRD.payload))),
  );
};
