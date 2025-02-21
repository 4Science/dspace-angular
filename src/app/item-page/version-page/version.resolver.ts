import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../app.reducer';
import {
  followLink,
  FollowLinkConfig,
} from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { VersionDataService } from '@dspace/core';
import { ResolvedAction } from '@dspace/core';
import { getFirstCompletedRemoteData } from '@dspace/core';
import { Version } from '@dspace/core';

/**
 * The self links defined in this list are expected to be requested somewhere in the near future
 * Requesting them as embeds will limit the number of requests
 */
export const VERSION_PAGE_LINKS_TO_FOLLOW: FollowLinkConfig<Version>[] = [
  followLink('item'),
];

/**
 * Method for resolving a version based on the parameters in the current route
 * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
 * @param {RouterStateSnapshot} state The current RouterStateSnapshot
 * @param {VersionDataService} versionService
 * @param {Store<AppState>} store
 * @returns Observable<<RemoteData<Item>> Emits the found item based on the parameters in the current route,
 * or an error if something went wrong
 */
export const versionResolver: ResolveFn<RemoteData<Version>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  versionService: VersionDataService = inject(VersionDataService),
  store: Store<AppState> = inject(Store<AppState>),
): Observable<RemoteData<Version>> => {
  const versionRD$ = versionService.findById(route.params.id,
    true,
    false,
    ...VERSION_PAGE_LINKS_TO_FOLLOW,
  ).pipe(
    getFirstCompletedRemoteData(),
  );

  versionRD$.subscribe((versionRD: RemoteData<Version>) => {
    store.dispatch(new ResolvedAction(state.url, versionRD.payload));
  });

  return versionRD$;
};
