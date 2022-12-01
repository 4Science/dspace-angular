import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { RemoteData } from '../../../core/data/remote-data';
import { Store } from '@ngrx/store';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { tap } from 'rxjs/operators';
import { ResolvedAction } from '../../../core/resolving/resolver.actions';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { followLink, FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';

export const BITSTREAM_VIEWER_LINKS_TO_FOLLOW: FollowLinkConfig<Bitstream>[] = [
  followLink('bundle'),
  followLink('format'),
  followLink('thumbnail'),
  //followLink('content'),
];

@Injectable()
export class BitstreamViewerResolver implements Resolve<RemoteData<Bitstream>> {
  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected store: Store<any>,
    protected router: Router
  ) {
  }

  /**
   * Method for resolving an item based on the parameters in the current route
   * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
   * @param {RouterStateSnapshot} state The current RouterStateSnapshot
   * @returns Observable<<RemoteData<Item>> Emits the found item based on the parameters in the current route,
   * or an error if something went wrong
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<RemoteData<Bitstream>> {
    return this.bitstreamDataService.findById(route.params.bitstream_id,
      true,
      false,
      ...BITSTREAM_VIEWER_LINKS_TO_FOLLOW
    ).pipe(
      getFirstCompletedRemoteData(),
      tap((bitstreamRD: RemoteData<Bitstream>) => this.store.dispatch(new ResolvedAction(state.url, bitstreamRD.payload)))
    );
  }
}
