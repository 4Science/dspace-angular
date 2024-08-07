import { Injectable } from '@angular/core';

import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Metric } from '../shared/metric.model';
import { METRIC } from '../shared/metric.resource-type';
import { dataService } from './base/data-service.decorator';
import { IdentifiableDataService } from './base/identifiable-data.service';
import { RequestService } from './request.service';

/**
 * A service responsible for fetching data from the REST API on the metrics endpoint
 */
@Injectable()
@dataService(METRIC)
export class MetricsDataService extends IdentifiableDataService<Metric> {

  protected linkPath = 'metrics';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
  ) {
    super('metrics', requestService, rdbService, objectCache, halService);
  }

}
