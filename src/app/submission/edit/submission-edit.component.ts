import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap,
  Router,
} from '@angular/router';
import {
  hasValue,
  isEmpty,
  isNotEmptyOperator,
  isNotNull,
} from '@dspace/shared/utils';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  Subscription,
} from 'rxjs';
import {
  debounceTime,
  filter,
  switchMap,
} from 'rxjs/operators';

import { SubmissionDefinitionsModel } from '@dspace/core';
import { ItemDataService } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { Collection } from '@dspace/core';
import { Item } from '@dspace/core';
import { getAllSucceededRemoteData } from '@dspace/core';
import { SubmissionObject } from '@dspace/core';
import { WorkspaceitemSectionsObject } from '@dspace/core';
import { SubmissionJsonPatchOperationsService } from '@dspace/core';
import { SubmissionFormComponent } from '../form/submission-form.component';
import { SubmissionError } from '../../../../modules/core/src/lib/core/submission/models/submission-error.model';
import { SubmissionService } from '../../../../modules/core/src/lib/core/submission/submission.service';
import parseSectionErrors from '../utils/parseSectionErrors';

/**
 * This component allows to edit an existing workspaceitem/workflowitem.
 */
@Component({
  selector: 'ds-base-submission-edit',
  styleUrls: ['./submission-edit.component.scss'],
  templateUrl: './submission-edit.component.html',
  standalone: true,
  imports: [
    SubmissionFormComponent,
  ],
})
export class SubmissionEditComponent implements OnDestroy, OnInit {

  /**
   * The collection id this submission belonging to
   * @type {string}
   */
  public collectionId: string;

  /**
   * Checks if the collection can be modifiable by the user
   * @type {booelan}
   */
  public collectionModifiable: boolean | null = null;


  /**
   * The list of submission's sections
   * @type {WorkspaceitemSectionsObject}
   */
  public sections: WorkspaceitemSectionsObject;

  /**
   * The submission self url
   * @type {string}
   */
  public selfUrl: string;

  /**
   * The configuration object that define this submission
   * @type {SubmissionDefinitionsModel}
   */
  public submissionDefinition: SubmissionDefinitionsModel;

  /**
   * The submission errors present in the submission object
   * @type {SubmissionError}
   */
  public submissionErrors: SubmissionError;

  /**
   * The submission id
   * @type {string}
   */
  public submissionId: string;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  private subs: Subscription[] = [];

  /**
   * BehaviorSubject containing the self link to the item for this submission
   * @private
   */
  private itemLink$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * The item for this submission.
   */
  public item: Item;

  /**
   * Initialize instance variables
   *
   * @param {ChangeDetectorRef} changeDetectorRef
   * @param {NotificationsService} notificationsService
   * @param {ActivatedRoute} route
   * @param {Router} router
   * @param {ItemDataService} itemDataService
   * @param {SubmissionService} submissionService
   * @param {TranslateService} translate
   * @param {SubmissionJsonPatchOperationsService} submissionJsonPatchOperationsService
   */
  constructor(private changeDetectorRef: ChangeDetectorRef,
              private notificationsService: NotificationsService,
              private route: ActivatedRoute,
              private router: Router,
              private itemDataService: ItemDataService,
              private submissionService: SubmissionService,
              private translate: TranslateService,
              private submissionJsonPatchOperationsService: SubmissionJsonPatchOperationsService) {
  }

  /**
   * Retrieve workspaceitem/workflowitem from server and initialize all instance variables
   */
  ngOnInit() {

    this.collectionModifiable = this.route.snapshot.data?.collectionModifiable ?? null;

    this.subs.push(
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) => this.submissionService.retrieveSubmission(params.get('id'))),
        // NOTE new submission is retrieved on the browser side only, so get null on server side rendering
        filter((submissionObjectRD: RemoteData<SubmissionObject>) => isNotNull(submissionObjectRD)),
      ).subscribe((submissionObjectRD: RemoteData<SubmissionObject>) => {
        if (submissionObjectRD.hasSucceeded) {
          if (isEmpty(submissionObjectRD.payload)) {
            this.notificationsService.info(null, this.translate.get('submission.general.cannot_submit'));
            this.router.navigate(['/mydspace']);
          } else {
            const { errors } = submissionObjectRD.payload;
            this.submissionErrors = parseSectionErrors(errors);
            this.submissionId = submissionObjectRD.payload.id.toString();
            this.collectionId = (submissionObjectRD.payload.collection as Collection).id;
            this.selfUrl = submissionObjectRD.payload._links.self.href;
            this.sections = submissionObjectRD.payload.sections;
            this.itemLink$.next(submissionObjectRD.payload._links.item.href);
            this.item = submissionObjectRD.payload.item;
            this.submissionDefinition = (submissionObjectRD.payload.submissionDefinition as SubmissionDefinitionsModel);
          }
        } else {
          if (submissionObjectRD.statusCode === 404) {
            // redirect to not found page
            this.router.navigate(['/404'], { skipLocationChange: true });
          }
          // TODO handle generic error
        }
      }),
      this.itemLink$.pipe(
        isNotEmptyOperator(),
        switchMap((itemLink: string) =>
          this.itemDataService.findByHref(itemLink),
        ),
        getAllSucceededRemoteData(),
        // Multiple sources can update the item in quick succession.
        // We only want to rerender the form if the item is unchanged for some time
        debounceTime(300),
      ).subscribe((itemRd: RemoteData<Item>) => {
        this.item = itemRd.payload;
        this.changeDetectorRef.detectChanges();
      }),
    );
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy() {
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());

    this.submissionJsonPatchOperationsService.deletePendingJsonPatchOperations();
  }
}
