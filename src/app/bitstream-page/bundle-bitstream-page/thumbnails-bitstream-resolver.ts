import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BundleDataService } from '../../core/data/bundle-data.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import {
  createNoContentRemoteDataObject,
  createSuccessfulRemoteDataObject,
} from '../../shared/remote-data.utils';
import { PaginatedSearchOptions } from '../../shared/search/models/paginated-search-options.model';

/**
 * Function for resolving a bitstream based on the parameters in the current route
 * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
 * @param {RouterStateSnapshot} state The current RouterStateSnapshot
 * @returns Observable<RemoteData<PaginatedList<Bitstream>>> Emits the found bitstream based on the parameters in the current route,
 * or an error if something went wrong
 */
export const thumbnailsBitstreamResolver: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<any> => {
  const bundleDataService = inject(BundleDataService);
  const bundleId = route.params.bundle_uuid;
  const thumbnailIndex = route.params.thumbnail_id;
  const paginatedOptions = new PaginatedSearchOptions({
    pagination: Object.assign(new PaginationComponentOptions(), { id: thumbnailIndex, pageSize: 1, currentPage: thumbnailIndex }),
  });

  return bundleDataService.getBitstreams(bundleId, paginatedOptions)
    .pipe(
      getFirstCompletedRemoteData(),
      map((data) => data.payload?.page[0]),
      map((data) => {
        return data ? createSuccessfulRemoteDataObject(data) : createNoContentRemoteDataObject();
      }),
    );
};
