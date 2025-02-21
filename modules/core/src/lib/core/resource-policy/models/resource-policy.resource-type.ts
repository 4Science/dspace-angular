import { ResourceType } from '../../shared';

/**
 * The resource type for ResourcePolicy
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const RESOURCE_POLICY = new ResourceType('resourcepolicy');
