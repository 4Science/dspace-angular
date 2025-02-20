import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../app.reducer';
import {
  APP_CONFIG,
  AppConfig,
} from '../../config/app-config.interface';
import {
  followLink,
  FollowLinkConfig,
} from '../../data/follow-link-config.model';
import { ItemDataService } from '../../data/item-data.service';
import { RemoteData } from '../../data/remote-data';
import { ResolvedAction } from '../../resolving/resolver.actions';
import { Item } from '../item.model';
import { getFirstCompletedRemoteData } from '../operators';

/**
 * The self links defined in this list are expected to be requested somewhere in the near future
 * Requesting them as embeds will limit the number of requests
 */
export function getItemPageLinksToFollow(showAccessStatuses: boolean): FollowLinkConfig<Item>[] {
  const followLinks: FollowLinkConfig<Item>[] = [
    followLink('owningCollection', {},
      followLink('parentCommunity', {},
        followLink('parentCommunity')),
    ),
    followLink('relationships'),
    followLink('version', {}, followLink('versionhistory')),
    followLink('thumbnail'),
  ];
  if (showAccessStatuses) {
    followLinks.push(followLink('accessStatus'));
  }
  return followLinks;
}

export const itemResolver: ResolveFn<RemoteData<Item>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  itemService: ItemDataService = inject(ItemDataService),
  store: Store<AppState> = inject(Store<AppState>),
  appConfig: AppConfig = inject(APP_CONFIG),
): Observable<RemoteData<Item>> => {
  const itemRD$ = itemService.findById(
    route.params.id,
    true,
    false,
    ...getItemPageLinksToFollow(appConfig.item.showAccessStatuses),
  ).pipe(
    getFirstCompletedRemoteData(),
  );

  itemRD$.subscribe((itemRD: RemoteData<Item>) => {
    store.dispatch(new ResolvedAction(state.url, itemRD.payload));
  });

  return itemRD$;
};
