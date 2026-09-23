import { Injectable } from '@angular/core';
import { dataService } from '../data/base/data-service.decorator';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { RequestService } from '../data/request.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { map } from 'rxjs/operators';
import { getAllSucceededRemoteDataPayload, getPaginatedListPayload } from '../shared/operators';
import { Observable } from 'rxjs';
import { RemoteData } from '../data/remote-data';
import { PaginatedList } from '../data/paginated-list.model';
import { AssociateItemMode } from './models/associateitem-mode.model';
import { SearchDataImpl } from '../data/base/search-data';
import { IdentifiableDataService } from '../data/base/identifiable-data.service';
import {FindListOptions} from '../data/find-list-options.model';

/**
 * A service that provides methods to make REST requests with AssociateItemMode endpoint.
 */

@Injectable()
@dataService(AssociateItemMode.type)
export class AssociateItemModeDataService extends IdentifiableDataService<AssociateItemMode> {
  protected linkPath = 'associateitemmodes';
  protected searchById = 'findModesById';
  private searchData: SearchDataImpl<AssociateItemMode>;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService){
      super('associateitems', requestService, rdbService, objectCache, halService);
      this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  /**
   * Search for AssociateItemMode from the Item id
   *
   * @param id string id of associate item
   * @param useCachedVersionIfAvailable   If this is true, the request will only be sent if there's
   *                                      no valid cached version. Defaults to false
   * @return Paginated list of associate item modes
   */
  searchAssociateModesById(id: string, useCachedVersionIfAvailable = true, reRequestOnStale = true): Observable<RemoteData<PaginatedList<AssociateItemMode>>> {
    const options = new FindListOptions();
    options.searchParams = [
      {
        fieldName: 'uuid',
        fieldValue: id
      },
    ];
    return this.searchData.searchBy(this.searchById, options, useCachedVersionIfAvailable, reRequestOnStale);
  }
    /*const hrefObs = this.getSearchByHref(
      'findModesById', {
      searchParams: [
        {
          fieldName: 'uuid',
          fieldValue: id
        },
      ]
    });
    hrefObs.pipe(
      take(1)
    ).subscribe((href) => {
      const request = new GetRequest(this.requestService.generateRequestId(), href);
      this.requestService.send(request, useCachedVersionIfAvailable);
    });
    return this.rdbService.buildList<AssociateItemMode>(hrefObs);*(
  }
  */

  /**
   * Check if associateMode with id is part of the associate item with id
   *
   * @param id string id of associate item
   * @param associateModeId string id of associate item
   * @return boolean
   */
  checkAssociateModeByIdAndType(id: string, associateModeId: string) {
    return this.searchAssociateModesById(id).pipe(
      getAllSucceededRemoteDataPayload(),
      getPaginatedListPayload(),
      map((editModes: AssociateItemMode[]) => {
        return !!editModes.find(editMode => editMode.modename === associateModeId);
      }));
  }

  getAssociateModeByIdAndType(id: string, associateModeId: string) {
    return this.searchAssociateModesById(id).pipe(
      getAllSucceededRemoteDataPayload(),
      getPaginatedListPayload(),
      map((editModes: AssociateItemMode[]) => {
        return editModes.find(editMode => editMode.modename === associateModeId);
      }));
  }

  /**
   * Invalidate the cache of the associateMode
   * @param id
   */
  invalidateItemCache(id: string) {
    this.requestService.setStaleByHrefSubstring('findModesById?uuid=' + id);
  }

}
