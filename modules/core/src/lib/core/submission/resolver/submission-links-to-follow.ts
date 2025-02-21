import {
  followLink,
  FollowLinkConfig,
} from '../../data';
import { WorkflowItem } from '../models';
import { WorkspaceItem } from '../models';

/**
 * The self links defined in this list are expected to be requested somewhere in the near future
 * Requesting them as embeds will limit the number of requests
 *
 * Needs to be in a separate file to prevent circular dependencies in webpack.
 */
export const SUBMISSION_LINKS_TO_FOLLOW: FollowLinkConfig<WorkflowItem | WorkspaceItem>[] = [
  followLink('item'),
  followLink('collection'),
];
