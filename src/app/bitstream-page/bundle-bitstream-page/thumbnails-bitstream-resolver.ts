import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {BundleDataService} from '../../core/data/bundle-data.service';
import {Observable} from 'rxjs';
import {PaginatedSearchOptions} from '../../shared/search/models/paginated-search-options.model';
import {PaginationComponentOptions} from '../../shared/pagination/pagination-component-options.model';
import {getFirstCompletedRemoteData} from '../../core/shared/operators';
import {map} from 'rxjs/operators';
import {
  createNoContentRemoteDataObject,
  createSuccessfulRemoteDataObject,
} from '../../shared/remote-data.utils';


@Injectable({
  providedIn: 'root'
})
export class ThumbnailsBitstreamResolver implements Resolve<any> {
  constructor(protected bundleDataService: BundleDataService) {
  }
  /**
   * Method for resolving a bitstream based on the parameters in the current route
   * @param {ActivatedRouteSnapshot} route The current ActivatedRouteSnapshot
   * @param {RouterStateSnapshot} state The current RouterStateSnapshot
   * @returns Observable<RemoteData<PaginatedList<Bitstream>>> Emits the found bitstream based on the parameters in the current route,
   * or an error if something went wrong
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const bundleId = route.params.bundle_uuid;
    const thumbnailIndex = route.params.thumbnail_id;
    const paginatedOptions = new PaginatedSearchOptions({
      pagination: Object.assign(new PaginationComponentOptions(), { id: thumbnailIndex , pageSize: 1, currentPage: thumbnailIndex})});
    return this.bundleDataService.getBitstreams(bundleId, paginatedOptions)
      .pipe(
        getFirstCompletedRemoteData(),
        map ((data) => data.payload?.page[0]),
        map ((data) => {
          return data ? createSuccessfulRemoteDataObject(data) : createNoContentRemoteDataObject();
        })
      );
  }
}

