import {
  autoserialize,
  autoserializeAs,
  deserialize,
  inheritSerialization,
} from 'cerialize';

import { StatisticsType } from '../../../statistics-page/cris-statistics-page/statistics-type.model';
import { typedObject } from '../../cache/builders/build-decorators';
import { HALLink } from '../../shared/hal-link.model';
import { HALResource } from '../../shared/hal-resource.model';
import { ResourceType } from '../../shared/resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { USAGE_REPORT } from './usage-report.resource-type';

/**
 * A usage report.
 */
@typedObject
@inheritSerialization(HALResource)
export class UsageReport extends HALResource {

  static type = USAGE_REPORT;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  @autoserialize
  id: string;

  @autoserializeAs('view-mode')
    viewMode: StatisticsType;

  @autoserializeAs('report-type')
    reportType: string;

  @autoserialize
  points: Point[];

  @deserialize
  _links: {
    category?: HALLink;
    self: HALLink;
  };
}

/**
 * A statistics data point.
 */
export interface Point {
  id: string;
  label: string;
  type: string;
  values: any;
  //  {
  //   views?: number;
  //   downloads?: number;
  // }[];
}
