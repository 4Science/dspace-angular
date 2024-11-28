import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { SubmissionState } from '../../submission.reducers';
import { ExecuteExternalUploadAction } from '../../objects/submission-objects.actions';


/**
 * A service that provides methods used in the external upload process.
 */
@Injectable()
export class ExternalUploadService {

  /**
   * Initialize service variables.
   * @param {Store<SubmissionState>} store
   */
  constructor(private store: Store<SubmissionState>) {
  }

  /**
   * Save the workspace response from upload into the store.
   * @param {string} submissionId
   *    The submission id
   * @param {string} sectionId
   *    The section id
   */
  executeExternalUpload(submissionId: string, sectionId: string): void {
    this.store.dispatch(new ExecuteExternalUploadAction(submissionId, sectionId));
  }

}
