import { Injectable } from '@angular/core';

import { RemoteDataBuildService } from '../../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../cache/object-cache.service';
import { Feature } from '../../shared/feature.model';
import { FEATURE } from '../../shared/feature.resource-type';
import { HALEndpointService } from '../../shared/hal-endpoint.service';
import { BaseDataService } from '../base/base-data.service';
import { dataService } from '../base/data-service.decorator';
import { RequestService } from '../request.service';

/**
 * A service to retrieve {@link Feature}s from the REST API
 */
@Injectable()
@dataService(FEATURE)
export class FeatureDataService extends BaseDataService<Feature> {
  protected linkPath = 'features';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('features', requestService, rdbService, objectCache, halService);
  }
}
