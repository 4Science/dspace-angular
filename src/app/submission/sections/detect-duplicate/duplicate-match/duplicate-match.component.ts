import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  NgbModal,
  NgbModalRef,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  Observable,
  of as observableOf,
} from 'rxjs';
import {
  filter,
  take,
} from 'rxjs/operators';
import { BtnDisabledDirective } from 'src/app/shared/btn-disabled.directive';

import { environment } from '../../../../../environments/environment';
import { JsonPatchOperationPathCombiner } from '../../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { JsonPatchOperationsBuilder } from '../../../../core/json-patch/builder/json-patch-operations-builder';
import { Item } from '../../../../core/shared/item.model';
import { DetectDuplicateMatch } from '../../../../core/submission/models/workspaceitem-section-deduplication.model';
import { SubmissionScopeType } from '../../../../core/submission/submission-scope-type';
import { getItemPageRoute } from '../../../../item-page/item-page-routing-paths';
import { isNotEmpty } from '../../../../shared/empty.util';
import { ThemedItemListPreviewComponent } from '../../../../shared/object-list/my-dspace-result-list-element/item-list-preview/themed-item-list-preview.component';
import { SubmissionService } from '../../../submission.service';
import { SectionsService } from '../../sections.service';
import { DetectDuplicateService } from '../detect-duplicate.service';
import { DuplicateDecision } from '../models/duplicate-decision.model';
import { DuplicateDecisionType } from '../models/duplicate-decision-type';
import { DuplicateDecisionValue } from '../models/duplicate-decision-value';
import { DuplicateMatchMetadataDetailConfig } from '../models/duplicate-detail-metadata.model';

/**
 * This component shows a single possible duplication within the duplications section.
 */
@Component({
  selector: 'ds-duplicate-match',
  templateUrl: 'duplicate-match.component.html',
  imports: [
    ThemedItemListPreviewComponent,
    AsyncPipe,
    TranslateModule,
    NgIf,
    NgbTooltipModule,
    RouterLink,
    ReactiveFormsModule,
    BtnDisabledDirective,
  ],
  standalone: true,
})

export class DuplicateMatchComponent implements OnInit {
  /**
   * The submission section ID.
   * @type {string}
   */
  @Input() sectionId: string;

  /**
   * The item ID of a possible duplication for which you want to record a decision.
   * @type {string}
   */
  @Input() itemId: string;

  /**
   * A possible duplication match object.
   * @type {DetectDuplicateMatch}
   */
  @Input() match: DetectDuplicateMatch;

  /**
   * Representing the possibility to take decisions on the matches
   * @type {boolean}
   */
  @Input() readOnly = false;

  /**
   * The submission ID.
   * @type {string}
   */
  @Input() submissionId: string;

  /**
   * The index number to sort the possible duplication matches inside the pagination system.
   * @type {string}
   */
  @Input() index: string;

  /**
   * The search result object.
   * @type {object}
   */
  object = { hitHighlights: [] };

  /**
   * A possible duplication match object item.
   * @type {Item}
   */
  item: Item;

  /**
   * The item page route
   */
  itemPageRoute: string;

  /**
   * If TRUE the submission scope is the 'workflow'; 'workspace' otherwise.
   * @type {boolean}
   */
  isWorkFlow = false;

  /**
   * If TRUE the submission decision will be rendered in the HTML output.
   * @type {boolean}
   */
  showSubmitterDecision = false;

  /**
   * The list of decision types.
   * @type {DuplicateDecisionType}
   */
  decisionType: DuplicateDecisionType;

  /**
   * The submitter decision translated text.
   * @type {Observable<string>}
   */
  submitterDecision$: Observable<string>;

  /**
   * The submitter decision notes.
   * @type {string}
   */
  submitterNote: string;

  /**
   * If TRUE, the possible duplication already has a saved decision.
   * @type {boolean}
   */
  hasDecision: boolean;

  /**
   * The modal 'close' return value.
   * @type {string}
   */
  closeResult: string;

  /**
   * The form where to write the reject decision notes.
   * @type {FormGroup}
   */
  rejectForm: FormGroup;

  /**
   * The modal reference to the HTML.
   * @type {NgbModalRef}
   */
  modalRef: NgbModalRef;

  /**
   * Combines a variable number of strings representing parts of a JSON-PATCH path.
   * @type {JsonPatchOperationPathCombiner}
   */
  pathCombiner: JsonPatchOperationPathCombiner;

  /**
   * Use to change the Verify button label during the saving process.
   * @type {Observable<boolean>}
   */
  public processingVerify: Observable<boolean> = observableOf(false);

  /**
   * Use to change the Reject button label during the saving process.
   * @type {Observable<boolean>}
   */
  public processingReject: Observable<boolean> = observableOf(false);

  /**
   * Contains the CSS class for the submitter decision text.
   * @type {string}
   */
  decisionLabelClass: string;

  /**
   * 'It is a duplication' button label.
   * @type {Observable<string>}
   */
  duplicateBtnLabel$: Observable<string>;

  /**
   * 'Not a duplication' button label.
   * @type {Observable<string>}
   */
  notDuplicateBtnLabel$: Observable<string>;

  /**
   * The list of the metadata, of the possible duplication, to show in HTML.
   * @type {DuplicateMatchMetadataDetailConfig}
   */
  metadataList: DuplicateMatchMetadataDetailConfig[];

  /**
   * Initialize instance variables.
   *
   * @param {DetectDuplicateService} detectDuplicateService
   * @param {FormBuilder} formBuilder
   * @param {NgbModal} modalService
   * @param {JsonPatchOperationsBuilder} operationsBuilder
   * @param {SectionsService} sectionService
   * @param {SubmissionService} submissionService
   * @param {TranslateService} translate
   */
  constructor(private detectDuplicateService: DetectDuplicateService,
              private formBuilder: FormBuilder,
              private modalService: NgbModal,
              private operationsBuilder: JsonPatchOperationsBuilder,
              private sectionService: SectionsService,
              private submissionService: SubmissionService,
              private translate: TranslateService) {
    this.metadataList = environment.submission.detectDuplicate.metadataDetailsList || [];
  }

  /**
   * Initialize all instance variables and retrieve configuration.
   */
  ngOnInit(): void {
    this.isWorkFlow = this.submissionService.getSubmissionScope() === SubmissionScopeType.WorkflowItem;
    this.decisionType = this.isWorkFlow ? DuplicateDecisionType.WORKFLOW : DuplicateDecisionType.WORKSPACE;
    this.item = Object.assign(new Item(), this.match.matchObject);
    this.itemPageRoute = getItemPageRoute(this.item);

    this.rejectForm = this.formBuilder.group({
      reason: [''],
    });

    this.hasDecision = this.isWorkFlow ?
      this.match.workflowDecision !== null
      : this.match.submitterDecision !== null;

    if (this.match.submitterDecision) {
      this.submitterDecision$ = (this.match.submitterDecision === DuplicateDecisionValue.Reject.toString()) ?
        this.translate.get('submission.sections.detect-duplicate.not-duplicate') :
        this.translate.get('submission.sections.detect-duplicate.duplicate');
      this.decisionLabelClass = (this.match.submitterDecision === DuplicateDecisionValue.Reject.toString()) ? 'badge-success' : 'badge-warning';
      this.submitterNote = this.match.submitterNote;
    } else {
      this.submitterDecision$ = this.translate.get('submission.sections.detect-duplicate.no-decision');
      this.decisionLabelClass = 'badge-light';
    }

    this.pathCombiner = new JsonPatchOperationPathCombiner('sections', this.sectionId);

    this.duplicateBtnLabel$ = this.isWorkFlow ?
      ((this.match.submitterDecision === DuplicateDecisionValue.Verify.toString()) ?
        this.translate.get('submission.sections.detect-duplicate.confirm-duplicate') :
        this.translate.get('submission.sections.detect-duplicate.duplicate-ctrl'))
      : this.translate.get('submission.sections.detect-duplicate.duplicate');

    this.notDuplicateBtnLabel$ = (this.isWorkFlow && this.match.submitterDecision === DuplicateDecisionValue.Reject.toString()) ?
      this.translate.get('submission.sections.detect-duplicate.confirm-not-duplicate') :
      this.translate.get('submission.sections.detect-duplicate.not-duplicate');
  }

  /**
   * Save the 'It is a duplication' decision.
   */
  setAsDuplicate() {
    this.processingVerify = observableOf(true);
    const decision = new DuplicateDecision(
      DuplicateDecisionValue.Verify,
      this.decisionType,
      this.rejectForm.get('reason').value);

    this.dispatchAction(decision);
    this.modalRef.dismiss();
  }

  /**
   * Save the 'It is not a duplication' decision.
   */
  setAsNotDuplicate() {
    this.processingReject = observableOf(true);
    const decision = new DuplicateDecision(
      DuplicateDecisionValue.Reject,
      this.decisionType);

    this.dispatchAction(decision);
  }

  /**
   * Removes the previously saved decision.
   */
  clearDecision() {
    const decision = new DuplicateDecision(
      DuplicateDecisionValue.Undo,
      this.decisionType);

    this.dispatchAction(decision);
  }

  /**
   * Save the decision on the backend.
   *
   * @param {DuplicateDecision} decision
   *    the object containing the decision
   */
  private dispatchAction(decision: DuplicateDecision): void {
    const pathDecision = Array.of('matches', this.itemId, this.isWorkFlow ? 'workflowDecision' : 'submitterDecision').join('/');
    const payload = {
      value: isNotEmpty(decision.value) ? decision.value : null,
      note: isNotEmpty(decision.note) ? decision.note : null,
    };

    // dispatch patch operation only when section is active
    this.sectionService.isSectionActive(this.submissionId, this.sectionId).pipe(
      filter((isActive: boolean) => isActive),
      take(1))
      .subscribe(() => {
        this.operationsBuilder.add(this.pathCombiner.getPath(pathDecision), payload, false, true);
        this.detectDuplicateService.saveDuplicateDecision(this.submissionId, this.sectionId);
      });
  }

  /**
   * Open the decision modal.
   */
  openModal(modal) {
    this.rejectForm.reset();
    this.modalRef = this.modalService.open(modal);
  }

}
