import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  take,
} from 'rxjs/operators';

import { Process } from '../../../process-page/processes/process.model';
import { ProcessParameter } from '../../../process-page/processes/process-parameter.model';
import { Script } from '../../../process-page/scripts/script.model';
import { hasValue } from '../../../shared/empty.util';
import { FollowLinkConfig } from '../../../shared/utils/follow-link-config.model';
import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { getFirstCompletedRemoteData } from '../../shared/operators';
import { URLCombiner } from '../../url-combiner/url-combiner';
import {
  FindAllData,
  FindAllDataImpl,
} from '../base/find-all-data';
import { IdentifiableDataService } from '../base/identifiable-data.service';
import { FindListOptions } from '../find-list-options.model';
import { PaginatedList } from '../paginated-list.model';
import { RemoteData } from '../remote-data';
import { MultipartPostRequest } from '../request.models';
import { RequestService } from '../request.service';
import { RestRequest } from '../rest-request.model';

export const METADATA_IMPORT_SCRIPT_NAME = 'metadata-import';
export const METADATA_EXPORT_SCRIPT_NAME = 'metadata-export';
export const COLLECTION_EXPORT_SCRIPT_NAME = 'collection-export';
export const BATCH_IMPORT_SCRIPT_NAME = 'import';
export const BATCH_EXPORT_SCRIPT_NAME = 'export';
export const ITEM_EXPORT_SCRIPT_NAME = 'item-export';
export const BULK_ITEM_EXPORT_SCRIPT_NAME = 'bulk-item-export';

@Injectable({ providedIn: 'root' })
export class ScriptDataService extends IdentifiableDataService<Script> implements FindAllData<Script> {
  private findAllData: FindAllDataImpl<Script>;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('scripts', requestService, rdbService, objectCache, halService);

    this.findAllData = new FindAllDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
  }

  public invoke(scriptName: string, parameters: ProcessParameter[], files: File[]): Observable<RemoteData<Process>> {
    const requestId = this.requestService.generateRequestId();
    this.getBrowseEndpoint().pipe(
      take(1),
      map((endpoint: string) => new URLCombiner(endpoint, scriptName, 'processes').toString()),
      map((endpoint: string) => {
        const body = this.getInvocationFormData(parameters, files);
        return new MultipartPostRequest(requestId, endpoint, body);
      }),
    ).subscribe((request: RestRequest) => this.requestService.send(request));

    return this.rdbService.buildFromRequestUUID<Process>(requestId);
  }

  private getInvocationFormData(parameters: ProcessParameter[], files: File[]): FormData {
    const form: FormData = new FormData();
    form.set('properties', JSON.stringify(parameters));
    files.forEach((file: File) => {
      form.append('file', file);
    });
    return form;
  }

  /**
   * Check whether a script with given name exist; user needs to be allowed to execute script for this to to not throw a 401 Unauthorized
   * @param scriptName    script we want to check exists (and we can execute)
   */
  public scriptWithNameExistsAndCanExecute(scriptName: string): Observable<boolean> {
    return this.findById(scriptName).pipe(
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<Script>) => {
        return hasValue(rd.payload);
      }),
    );
  }

  /**
   * Returns {@link RemoteData} of all object with a list of {@link FollowLinkConfig}, to indicate which embedded
   * info should be added to the objects
   *
   * @param options                     Find list options object
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   * @return {Observable<RemoteData<PaginatedList<T>>>}
   *    Return an observable that emits object list
   */
  public findAll(options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<Script>[]): Observable<RemoteData<PaginatedList<Script>>> {
    return this.findAllData.findAll(options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }
}
