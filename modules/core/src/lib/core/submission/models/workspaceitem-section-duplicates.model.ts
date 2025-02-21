/*
 * Object model for the data returned by the REST API to present potential duplicates in a submission section
 */
import { Duplicate } from '../../data';

export interface WorkspaceitemSectionDuplicatesObject {
  potentialDuplicates?: Duplicate[]
}
