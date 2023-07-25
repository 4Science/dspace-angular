import { UnpaywallSectionStatus } from '../../../submission/sections/unpaywall/models/unpaywall-section-status';

/**
 * An interface to represent submission's unpaywall section data.
 */
export interface WorkspaceitemSectionUnpaywallObject {

  /**
   * Unpaywall api call id.
   */
  id: number;

  /**
   * Item DOI.
   */
  doi: string;

  /**
   * Item id.
   */
  itemId: string;

  /**
   * Api call status.
   */
  status: UnpaywallSectionStatus;

  /**
   * Item json record.
   */
  jsonRecord: string;

  /**
   * Timestamp created.
   */
  timestampCreated: Date;

  /**
   * Timestamp last modified.
   */
  timestampLastModified: Date;
}
