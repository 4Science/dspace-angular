import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { CONFIG_PROPERTY } from '../shared/config-property.resource-type';
import { ConfigurationProperty } from '../shared/configuration-property.model';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { dataService } from './base/data-service.decorator';
import { IdentifiableDataService } from './base/identifiable-data.service';
import { RemoteData } from './remote-data';
import { RequestService } from './request.service';

@Injectable()
@dataService(CONFIG_PROPERTY)
/**
 * Data Service responsible for retrieving Configuration properties
 */
export class ConfigurationDataService extends IdentifiableDataService<ConfigurationProperty> {

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('properties', requestService, rdbService, objectCache, halService);
  }

  /**
   * Finds a configuration property by name
   * @param name
   */
  findByPropertyName(name: string): Observable<RemoteData<ConfigurationProperty>> {
    return this.findById(name);
  }
}
