import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import {
  Observable,
  of,
} from 'rxjs';

import { BaseBitstreamViewerComponent } from '../viewers/bitstream-viewers/base-bitstream-viewer.component';
import { BaseItemViewerComponent } from '../viewers/item-viewers/base-item-viewer.component';
import { REGISTERED_VIEWERS } from '../viewers/registered-viewers';

/**
 * Function for resolving a component based on the viewer parameter in the current route
 * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
 * @param {RouterStateSnapshot} state The current RouterStateSnapshot
 * @returns Observable<BaseItemViewerComponent | BaseBitstreamViewerComponent> Emits the resolved component based on the viewer parameter in the current route
 */
export const componentProviderResolver: ResolveFn<BaseItemViewerComponent | BaseBitstreamViewerComponent> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<BaseItemViewerComponent | BaseBitstreamViewerComponent> => {
  return of(REGISTERED_VIEWERS[route.params.viewer] || null);
};
