/**
 * Represents a search configuration select option
 */
import { Context } from '@dspace/core';

export interface SearchConfigurationOption {

  /**
   * The select option value
   */
  value: string;

  /**
   * The select option label
   */
  label: string;

  /**
   * The search context to use with the configuration
   */
  context: Context;
}
