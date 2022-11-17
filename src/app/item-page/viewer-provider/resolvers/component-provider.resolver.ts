import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { BaseItemViewerComponent } from '../viewers/item-viewers/base-item-viewer.component';
import { BaseBitstreamViewerComponent } from '../viewers/bitstream-viewers/base-bitstream-viewer.component';
import { REGISTERED_VIEWERS } from '../viewers/registered-viewers';

@Injectable()
export class ComponentProviderResolver implements Resolve<BaseItemViewerComponent | BaseBitstreamViewerComponent> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BaseItemViewerComponent | BaseBitstreamViewerComponent> {
    return of(
      REGISTERED_VIEWERS[route.params.viewer] || null
    );
  }
}

