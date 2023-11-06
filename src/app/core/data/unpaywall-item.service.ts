import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RemoteData } from './remote-data';
import { UnpaywallItemVersionRequest } from '../shared/unpaywall-item-version.request.model';
import { BaseDataService } from './base/base-data.service';
import { dataService } from './base/data-service.decorator';
import { DefaultChangeAnalyzer } from './default-change-analyzer.service';
import { IdentifierData } from '../../shared/object-list/identifier-data/identifier-data.model';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestService } from './request.service';
import { Store } from '@ngrx/store';
import { CoreState } from '../core-state.model';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { HttpOptions } from '../dspace-rest/dspace-rest.service';
import { GetRequest } from './request.models';
import { RestRequest } from './rest-request.model';
import { Item } from '../shared/item.model';
import { UNPAYWALL_ITEM_VERSION_REQUEST } from '../shared/unpaywall-item-version-request.resource-type';
import { RequestEntryState } from './request-entry-state.model';
import { UnpaywallItemVersionModel } from '../submission/models/unpaywall-item-version.model';

/**
 * Service responsible for interacting with the Unpaywall API.
 */
@Injectable()
@dataService(UNPAYWALL_ITEM_VERSION_REQUEST)
export class UnpaywallItemService extends BaseDataService<UnpaywallItemVersionRequest> {

  constructor(
    protected comparator: DefaultChangeAnalyzer<IdentifierData>,
    protected halService: HALEndpointService,
    protected http: HttpClient,
    protected notificationsService: NotificationsService,
    protected objectCache: ObjectCacheService,
    protected rdbService: RemoteDataBuildService,
    protected requestService: RequestService,
    protected store: Store<CoreState>
  ) {
    super('items', requestService, rdbService, objectCache, halService);
  }

  /**
   * Retrieves versions of the item provided by Unpaywall API.
   *
   * @param item item
   * @returns observable of a list of item versions.
   */
  public getItemVersions(item: Item): Observable<UnpaywallItemVersionModel[]> {
    const requestId = this.requestService.generateRequestId();
    return this.getEndpoint().pipe(
      map((endpointURL: string) => {
        const options: HttpOptions = Object.create({});
        return new GetRequest(requestId, `${endpointURL}/${item.id}/unpaywall/versions`, item._links.self.href, options);
      }),
      tap(request => this.requestService.send(request, false)),
      switchMap((request: RestRequest) => this.rdbService.buildFromRequestUUID(request.uuid) as Observable<RemoteData<UnpaywallItemVersionRequest>>),
      switchMap(() => this.requestService.getByUUID(requestId)),
      filter(remoteDate => remoteDate.state === RequestEntryState.Success),
      map(remoteDate => remoteDate.response.unCacheableObject.versions)
    );
  }
}
