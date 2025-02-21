import { ResourceType } from '../shared';

/**
 * The resource type for the root endpoint
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const NOTIFYREQUEST = new ResourceType('notifyrequests');
