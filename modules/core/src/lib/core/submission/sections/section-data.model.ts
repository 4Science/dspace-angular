import { SectionsType } from '../models/sections-type';
import { SubmissionSectionError } from '../models/submission-section-error.model';
import { WorkspaceitemSectionDataType } from '../models/workspaceitem-sections.model';


/**
 * An interface to represent section model
 */
export interface SectionDataObject {

  /**
   * The section configuration url
   */
  config: string;

  /**
   * The section data object
   */
  data: WorkspaceitemSectionDataType;

  /**
   * The list of the section's errors to show
   */
  errorsToShow: SubmissionSectionError[];

  /**
   * The list of the section's errors detected by the server
   */
  serverValidationErrors: SubmissionSectionError[];

  /**
   * The section header
   */
  header: string;

  /**
   * The section id
   */
  id: string;

  /**
   * A boolean representing if this section is mandatory
   */
  mandatory: boolean;

  /**
   * The section type
   */
  sectionType: SectionsType;

  /**
   * Eventually additional fields
   */
  [propName: string]: any;
}
