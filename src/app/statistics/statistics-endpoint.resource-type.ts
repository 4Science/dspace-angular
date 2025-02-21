import { ResourceType } from '@dspace/core';

/**
 * The resource type for the statistics endpoint
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const STATISTICS_ENDPOINT = new ResourceType('statistics');
