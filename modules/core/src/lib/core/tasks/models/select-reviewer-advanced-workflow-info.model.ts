import {
  autoserialize,
  inheritSerialization,
} from 'cerialize';

import { typedObject } from '../../cache';
import { ResourceType } from '../../shared';
import { AdvancedWorkflowInfo } from './advanced-workflow-info.model';
import { SELECT_REVIEWER_ADVANCED_WORKFLOW_INFO } from './advanced-workflow-info.resource-type';

/**
 * A model class for a {@link SelectReviewerAdvancedWorkflowInfo}
 */
@typedObject
@inheritSerialization(AdvancedWorkflowInfo)
export class SelectReviewerAdvancedWorkflowInfo extends AdvancedWorkflowInfo {

  static type: ResourceType = SELECT_REVIEWER_ADVANCED_WORKFLOW_INFO;

  @autoserialize
  group: string;

}
