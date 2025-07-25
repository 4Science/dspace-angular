import {
  AsyncPipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  Observable,
  of as observableOf,
} from 'rxjs';

import { WorkspaceitemSectionIdentifiersObject } from '../../../core/submission/models/workspaceitem-section-identifiers.model';
import { VarDirective } from '../../../shared/utils/var.directive';
import { SubmissionService } from '../../submission.service';
import { SectionModelComponent } from '../models/section.model';
import { SectionDataObject } from '../models/section-data.model';
import { SectionsService } from '../sections.service';

/**
 * This simple component displays DOI, handle and other identifiers that are already minted for the item in
 * a workflow / submission section.
 * ShowMintIdentifierStep will attempt to reserve an identifier before injecting result data for this component.
 *
 * @author Kim Shepherd
 */
@Component({
  selector: 'ds-submission-section-identifiers',
  templateUrl: './section-identifiers.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [
    TranslateModule,
    NgForOf,
    NgIf,
    AsyncPipe,
    VarDirective,
  ],
  standalone: true,
})

export class SubmissionSectionIdentifiersComponent extends SectionModelComponent implements OnInit {

  /**
   * Variable to track if the section is loading.
   * @type {boolean}
   */
  public isLoading = true;

  /**
   * Observable identifierData subject
   * @type {Observable<WorkspaceitemSectionIdentifiersObject>}
   */
  public identifierData$: Observable<WorkspaceitemSectionIdentifiersObject>;

  /**
   * Initialize instance variables.
   *
   * @param {TranslateService} translate
   * @param {SectionsService} sectionService
   * @param {SubmissionService} submissionService
   * @param {string} injectedCollectionId
   * @param {SectionDataObject} injectedSectionData
   * @param {string} injectedSubmissionId
   */
  constructor(protected translate: TranslateService,
              protected sectionService: SectionsService,
              protected submissionService: SubmissionService,
              @Inject('collectionIdProvider') public injectedCollectionId: string,
              @Inject('sectionDataProvider') public injectedSectionData: SectionDataObject,
              @Inject('submissionIdProvider') public injectedSubmissionId: string) {
    super(injectedCollectionId, injectedSectionData, injectedSubmissionId);
  }

  /**
   * Initialize all instance variables and retrieve configuration.
   */
  onSectionInit() {
    this.isLoading = false;
    this.identifierData$ = this.getIdentifierData();
  }

  /**
   * Unsubscribe from all subscriptions, if needed.
   */
  onSectionDestroy(): void {
    return;
  }

  /**
   * Get section status. Because this simple component never requires human interaction, this is basically
   * always going to be the opposite of "is this section still loading". This is not the place for API response
   * error checking but determining whether the step can 'proceed'.
   *
   * @return Observable<boolean>
   *     the section status
   */
  public getSectionStatus(): Observable<boolean> {
    return observableOf(!this.isLoading);
  }

  /**
   * Get identifier data (from the REST service) as a simple object with doi, handle, otherIdentifiers variables
   * and as an observable so it can update in real-time.
   */
  getIdentifierData() {
    return this.sectionService.getSectionData(this.submissionId, this.sectionData.id, this.sectionData.sectionType) as
      Observable<WorkspaceitemSectionIdentifiersObject>;
  }

}
