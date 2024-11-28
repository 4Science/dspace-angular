import { Component, Inject, OnDestroy } from '@angular/core';
import { renderSectionFor } from '../sections-decorator';
import { SectionsType } from '../sections-type';
import { SectionModelComponent } from '../models/section.model';
import { SectionDataObject } from '../models/section-data.model';
import { SectionsService } from '../sections.service';
import { AlertType } from '../../../shared/alert/alert-type';
import { Observable, of } from 'rxjs';

import { filter, take,  } from 'rxjs/operators';
import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { JsonPatchOperationsBuilder } from '../../../core/json-patch/builder/json-patch-operations-builder';
import { ExternalUploadService } from './external-upload.service';
import { SubmissionService } from '../../submission.service';


/**
 * This component represents a section that contains the submission external-upload integration.
 */
@Component({
  selector: 'ds-section-external-upload-component',
  templateUrl: './section-external-upload.component.html',
  styleUrls: ['./section-external-upload.component.scss']
})
@renderSectionFor(SectionsType.ExternalUpload)
export class SectionExternalUploadComponent extends SectionModelComponent implements OnDestroy {

  public loading$ = this.submissionService.getExternalUplodaProcessingStatus(this.injectedSubmissionId);

  public AlertType = AlertType;

  /**
   * The source for the external upload
   */
  public source: string;

  /**
   * Combines a variable number of strings representing parts of a JSON-PATCH path.
   * @type {JsonPatchOperationPathCombiner}
   */
  public pathCombiner: JsonPatchOperationPathCombiner;

  /**
   * The path to build the patch operation
   * @private
   */
  private readonly patchOperationPath = ['source'];


  constructor(
    protected sectionService: SectionsService,
    private operationsBuilder: JsonPatchOperationsBuilder,
    private externalUploadService: ExternalUploadService,
    private submissionService: SubmissionService,
    @Inject('collectionIdProvider') public injectedCollectionId: string,
    @Inject('sectionDataProvider') public injectedSectionData: SectionDataObject,
    @Inject('submissionIdProvider') public injectedSubmissionId: string
  ) {
    super(
      injectedCollectionId,
      injectedSectionData,
      injectedSubmissionId,
    );
    this.pathCombiner = new JsonPatchOperationPathCombiner('sections', this.injectedSectionData.id);
  }

  public submitUpload() {
    this.dispatchExecuteUploadAction();
  }

  getSectionStatus(): Observable<boolean> {
    return of(true);
  }

  onSectionInit(): void {
    return;
  }

  onSectionDestroy(): void {
    return;
  }

  /**
   * Save the external source upload on the backend.
   */
  private dispatchExecuteUploadAction(): void {
    // dispatch patch operation only when section is active
    this.sectionService.isSectionActive(this.submissionId, this.injectedSectionData.id).pipe(
      filter((isActive: boolean) => isActive),
      take(1))
      .subscribe(() => {
        this.operationsBuilder.add(this.pathCombiner.getPath(this.patchOperationPath), this.source, false, true);
        this.externalUploadService.executeExternalUpload(this.submissionId, this.injectedSectionData.id);
      });
  }
}
