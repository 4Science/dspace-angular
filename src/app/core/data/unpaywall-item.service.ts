import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { NotificationsService } from '../../shared/notifications/notifications.service';
import { IdentifierData } from '../../shared/object-list/identifier-data/identifier-data.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { CoreState } from '../core-state.model';
import { HttpOptions } from '../dspace-rest/dspace-rest.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Item } from '../shared/item.model';
import { UnpaywallItemVersionRequest } from '../shared/unpaywall-item-version.request.model';
import { UnpaywallItemVersionModel } from '../submission/models/unpaywall-item-version.model';
import { BaseDataService } from './base/base-data.service';
import { DefaultChangeAnalyzer } from './default-change-analyzer.service';
import { RemoteData } from './remote-data';
import { GetRequest } from './request.models';
import { RequestService } from './request.service';
import { RequestEntryState } from './request-entry-state.model';
import { RestRequest } from './rest-request.model';

/**
 * Service responsible for interacting with the Unpaywall API.
 */
@Injectable()
export class UnpaywallItemService extends BaseDataService<UnpaywallItemVersionRequest> {

  constructor(
    protected comparator: DefaultChangeAnalyzer<IdentifierData>,
    protected halService: HALEndpointService,
    protected http: HttpClient,
    protected notificationsService: NotificationsService,
    protected objectCache: ObjectCacheService,
    protected rdbService: RemoteDataBuildService,
    protected requestService: RequestService,
    protected store: Store<CoreState>,
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
      map(remoteDate => remoteDate.response.unCacheableObject.versions),
    );
  }
}
