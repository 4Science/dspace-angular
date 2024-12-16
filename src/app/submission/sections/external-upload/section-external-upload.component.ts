import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
  of,
} from 'rxjs';
import {
  filter,
  take,
} from 'rxjs/operators';

import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { JsonPatchOperationsBuilder } from '../../../core/json-patch/builder/json-patch-operations-builder';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { AlertType } from '../../../shared/alert/alert-type';
import { ThemedLoadingComponent } from '../../../shared/loading/themed-loading.component';
import { SubmissionService } from '../../submission.service';
import { SectionModelComponent } from '../models/section.model';
import { SectionDataObject } from '../models/section-data.model';
import { SectionsService } from '../sections.service';
import { ExternalUploadService } from './external-upload.service';


/**
 * This component represents a section that contains the submission external-upload integration.
 */
@Component({
  selector: 'ds-section-external-upload-component',
  templateUrl: './section-external-upload.component.html',
  styleUrls: ['./section-external-upload.component.scss'],
  imports: [
    AlertComponent,
    FormsModule,
    NgIf,
    AsyncPipe,
    TranslateModule,
    ThemedLoadingComponent,
  ],
  standalone: true,
})
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
    @Inject('submissionIdProvider') public injectedSubmissionId: string,
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
