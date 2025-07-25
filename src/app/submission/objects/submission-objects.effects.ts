import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
} from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import findKey from 'lodash/findKey';
import isEqual from 'lodash/isEqual';
import union from 'lodash/union';
import {
  from as observableFrom,
  Observable,
  of as observableOf,
} from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  map,
  mergeMap,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { RemoteData } from '../../core/data/remote-data';
import { Item } from '../../core/shared/item.model';
import { getFirstSucceededRemoteDataPayload } from '../../core/shared/operators';
import {
  SubmissionObject,
  SubmissionObjectError,
} from '../../core/submission/models/submission-object.model';
import { WorkflowItem } from '../../core/submission/models/workflowitem.model';
import { WorkspaceItem } from '../../core/submission/models/workspaceitem.model';
import { WorkspaceitemSectionDetectDuplicateObject } from '../../core/submission/models/workspaceitem-section-deduplication.model';
import { WorkspaceitemSectionDuplicatesObject } from '../../core/submission/models/workspaceitem-section-duplicates.model';
import { WorkspaceitemSectionUploadObject } from '../../core/submission/models/workspaceitem-section-upload.model';
import { WorkspaceitemSectionsObject } from '../../core/submission/models/workspaceitem-sections.model';
import { SubmissionJsonPatchOperationsService } from '../../core/submission/submission-json-patch-operations.service';
import { SubmissionObjectDataService } from '../../core/submission/submission-object-data.service';
import { SubmissionScopeType } from '../../core/submission/submission-scope-type';
import { WorkspaceitemDataService } from '../../core/submission/workspaceitem-data.service';
import {
  isEmpty,
  isNotEmpty,
  isNotUndefined,
  isUndefined,
} from '../../shared/empty.util';
import { FormState } from '../../shared/form/form.reducer';
import { NotificationOptions } from '../../shared/notifications/models/notification-options.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { SectionsService } from '../sections/sections.service';
import { SectionsType } from '../sections/sections-type';
import { SubmissionState } from '../submission.reducers';
import { SubmissionService } from '../submission.service';
import parseSectionErrorPaths, { SectionErrorPath } from '../utils/parseSectionErrorPaths';
import parseSectionErrors from '../utils/parseSectionErrors';
import {
  CleanDetectDuplicateAction,
  CleanDuplicateDetectionAction,
  CompleteInitSubmissionFormAction,
  DepositSubmissionAction,
  DepositSubmissionErrorAction,
  DepositSubmissionSuccessAction,
  DisableSectionAction,
  DisableSectionErrorAction,
  DisableSectionSuccessAction,
  DiscardSubmissionErrorAction,
  DiscardSubmissionSuccessAction,
  InitSectionAction,
  InitSubmissionFormAction,
  ResetSubmissionFormAction,
  SaveAndDepositSubmissionAction,
  SaveForLaterSubmissionFormAction,
  SaveForLaterSubmissionFormSuccessAction,
  SaveSubmissionFormAction,
  SaveSubmissionFormErrorAction,
  SaveSubmissionFormSuccessAction,
  SaveSubmissionSectionFormAction,
  SaveSubmissionSectionFormErrorAction,
  SaveSubmissionSectionFormSuccessAction,
  SetDuplicateDecisionAction,
  SetDuplicateDecisionErrorAction,
  SetDuplicateDecisionSuccessAction,
  SubmissionObjectAction,
  SubmissionObjectActionTypes,
  UpdateSectionDataAction,
  UpdateSectionDataSuccessAction,
  UpdateSectionErrorsAction,
} from './submission-objects.actions';
import { SubmissionObjectEntry } from './submission-objects.reducer';
import { SubmissionSectionError } from './submission-section-error.model';
import { SubmissionSectionObject } from './submission-section-object.model';

@Injectable()
export class SubmissionObjectEffects {

  /**
   * Dispatch a [InitSectionAction] for every submission sections and dispatch a [CompleteInitSubmissionFormAction]
   */
  loadForm$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.INIT_SUBMISSION_FORM),
    map((action: InitSubmissionFormAction) => {
      const definition = action.payload.submissionDefinition;
      const mappedActions = [];
      definition.sections.page.forEach((sectionDefinition: any) => {
        const selfLink = sectionDefinition._links.self.href || sectionDefinition._links.self;
        const sectionId = selfLink.substr(selfLink.lastIndexOf('/') + 1);
        const config = sectionDefinition._links.config ? (sectionDefinition._links.config.href || sectionDefinition._links.config) : '';
        // A section is enabled if it is mandatory or contains data in its section payload
        let enabled = (sectionDefinition.mandatory || (isNotEmpty(action.payload.sections) && action.payload.sections.hasOwnProperty(sectionId)));

        // Duplicates will ignore mandatory and display only when "always display" is set or there is data to show
        if (sectionDefinition.sectionType === SectionsType.Duplicates) {
          enabled = (alwaysDisplayDuplicates() || isNotEmpty((action.payload.sections[sectionId] as WorkspaceitemSectionDuplicatesObject).potentialDuplicates));
        }

        // DetectDuplicate will ignore mandatory and display only when "always display" is set or there is data to show
        if (sectionDefinition.sectionType === SectionsType.DetectDuplicate) {
          enabled = (alwaysDisplayDuplicates() || isNotEmpty((action.payload.sections[sectionId] as WorkspaceitemSectionDetectDuplicateObject)?.matches));
        }

        // Correction will ignore mandatory and display only when there is data to show
        if (sectionDefinition.sectionType === SectionsType.Correction) {
          enabled = !((action.payload.sections[sectionId] as any)?.empty);
        }

        let sectionData;
        if (sectionDefinition.sectionType !== SectionsType.SubmissionForm) {
          sectionData = (isNotUndefined(action.payload.sections) && isNotUndefined(action.payload.sections[sectionId])) ? action.payload.sections[sectionId] : Object.create(null);
        } else {
          sectionData = action.payload.item.metadata;
        }
        const sectionErrors = isNotEmpty(action.payload.errors) ? (action.payload.errors[sectionId] || null) : null;
        mappedActions.push(
          new InitSectionAction(
            action.payload.submissionId,
            sectionId,
            sectionDefinition.header,
            config,
            sectionDefinition.mandatory,
            sectionDefinition.opened,
            sectionDefinition.sectionType,
            sectionDefinition.visibility,
            enabled,
            sectionData,
            sectionErrors,
          ),
        );
      });
      return { action: action, definition: definition, mappedActions: mappedActions };
    }),
    mergeMap((result) => {
      return observableFrom(
        result.mappedActions.concat(
          new CompleteInitSubmissionFormAction(result.action.payload.submissionId),
        ));
    })));

  /**
   * Dispatch a [InitSubmissionFormAction]
   */
  resetForm$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.RESET_SUBMISSION_FORM),
    map((action: ResetSubmissionFormAction) =>
      new InitSubmissionFormAction(
        action.payload.collectionId,
        action.payload.submissionId,
        action.payload.selfUrl,
        action.payload.submissionDefinition,
        action.payload.sections,
        action.payload.item,
        null,
        action.payload.metadataSecurityConfiguration,
      ))));

  /**
   * Dispatch a [SaveSubmissionFormSuccessAction] or a [SaveSubmissionFormErrorAction] on error
   */
  saveSubmission$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SAVE_SUBMISSION_FORM),
    concatMap((action: SaveSubmissionFormAction) => {
      return this.operationsService.jsonPatchByResourceType(
        this.submissionService.getSubmissionObjectLinkName(),
        action.payload.submissionId,
        'sections',
      ).pipe(
        map((response: SubmissionObject[]) => new SaveSubmissionFormSuccessAction(action.payload.submissionId, response, action.payload.isManual, action.payload.isManual)),
        catchError((rd: unknown) => {
          if (rd instanceof RemoteData) {
            return observableFrom(
              this.parseErrorResponse(false, rd.errors, action.payload.submissionId, rd.statusCode, rd.errorMessage),
            );
          }
        }));
    })));

  /**
   * Dispatch a [SaveForLaterSubmissionFormSuccessAction] or a [SaveSubmissionFormErrorAction] on error
   */
  saveForLaterSubmission$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SAVE_FOR_LATER_SUBMISSION_FORM),
    concatMap((action: SaveForLaterSubmissionFormAction) => {
      return this.operationsService.jsonPatchByResourceType(
        this.submissionService.getSubmissionObjectLinkName(),
        action.payload.submissionId,
        'sections',
      ).pipe(
        map((response: SubmissionObject[]) => new SaveForLaterSubmissionFormSuccessAction(action.payload.submissionId, response)),
        catchError((rd: unknown) => {
          if (rd instanceof RemoteData) {
            return observableFrom(
              this.parseErrorResponse(false, rd.errors, action.payload.submissionId, rd.statusCode, rd.errorMessage),
            );
          }
        }));
    })));

  /**
   * Call parseSaveResponse and dispatch actions
   */
  saveSubmissionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SAVE_SUBMISSION_FORM_SUCCESS),
    withLatestFrom(this.store$),
    map(([action, currentState]: [SaveSubmissionFormSuccessAction, any]) => {
      return this.parseSaveResponse((currentState.submission as SubmissionState).objects[action.payload.submissionId],
        action.payload.submissionObject, action.payload.submissionId, currentState.forms,
        action.payload.showNotifications, action.payload.showErrors);
    }),
    mergeMap((actions) => observableFrom(actions))));

  /**
   * Call parseSaveResponse and dispatch actions.
   * Notification system is forced to be disabled.
   */
  saveSubmissionSectionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SAVE_SUBMISSION_SECTION_FORM_SUCCESS),
    withLatestFrom(this.store$),
    map(([action, currentState]: [SaveSubmissionSectionFormSuccessAction, any]) => {
      return this.parseSaveResponse((currentState.submission as SubmissionState).objects[action.payload.submissionId],
        action.payload.submissionObject, action.payload.submissionId, currentState.forms, false, false);
    }),
    mergeMap((actions) => observableFrom(actions))));

  /**
   * Dispatch a [SaveSubmissionSectionFormSuccessAction] or a [SaveSubmissionSectionFormErrorAction] on error
   */
  saveSection$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SAVE_SUBMISSION_SECTION_FORM),
    concatMap((action: SaveSubmissionSectionFormAction) => {
      return this.operationsService.jsonPatchByResourceID(
        this.submissionService.getSubmissionObjectLinkName(),
        action.payload.submissionId,
        'sections',
        action.payload.sectionId,
      ).pipe(
        map((response: SubmissionObject[]) => new SaveSubmissionSectionFormSuccessAction(action.payload.submissionId, response)),
        catchError((rd: unknown) => {
          if (rd instanceof RemoteData) {
            return observableFrom(
              this.parseErrorResponse(false, rd.errors, action.payload.submissionId, rd.statusCode, rd.errorMessage),
            );
          }
        }));
    })));

  /**
   * Show a notification on error
   */
  saveError$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SAVE_SUBMISSION_FORM_ERROR, SubmissionObjectActionTypes.SAVE_SUBMISSION_SECTION_FORM_ERROR),
    withLatestFrom(this.store$),
    tap(() => this.notificationsService.error(null, this.translate.get('submission.sections.general.save_error_notice')))), { dispatch: false });

  /**
   * Call parseSaveResponse and dispatch actions or dispatch [SaveSubmissionFormErrorAction] on error
   */
  saveAndDeposit$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SAVE_AND_DEPOSIT_SUBMISSION),
    withLatestFrom(this.submissionService.hasUnsavedModification()),
    concatMap(([action, hasUnsavedModification]: [SaveAndDepositSubmissionAction, boolean]) => {
      let response$: Observable<SubmissionObject[]>;
      if (hasUnsavedModification) {
        response$ = this.operationsService.jsonPatchByResourceType(
          this.submissionService.getSubmissionObjectLinkName(),
          action.payload.submissionId,
          'sections') as Observable<SubmissionObject[]>;
      } else {
        response$ = this.submissionObjectService.findById(action.payload.submissionId, false, true, followLink('item'), followLink('collection')).pipe(
          getFirstSucceededRemoteDataPayload(),
          map((submissionObject: SubmissionObject) => [submissionObject]),
        );
      }
      return response$.pipe(
        map((response: SubmissionObject[]) => {
          if (this.canDeposit(response)) {
            return new DepositSubmissionAction(action.payload.submissionId);
          } else {
            this.notificationsService.warning(
              null,
              this.translate.instant('submission.sections.general.cannot_deposit'),
              null,
              true,
            );
            return new SaveSubmissionFormSuccessAction(action.payload.submissionId, response, false, true);
          }
        }),
        catchError((rd: unknown) => {
          if (rd instanceof RemoteData) {
            return observableFrom(
              this.parseErrorResponse(false, rd.errors, action.payload.submissionId, rd.statusCode, rd.errorMessage),
            );
          }
        }));
    })));

  removeSection$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.DISABLE_SECTION),
    concatMap((action: DisableSectionAction) => {
      return this.operationsService.jsonPatchByResourceID(
        this.submissionService.getSubmissionObjectLinkName(),
        action.payload.submissionId,
        'sections',
        action.payload.sectionId).pipe(
        map(() => new DisableSectionSuccessAction(action.payload.submissionId, action.payload.sectionId)),
        catchError(() => observableOf(new DisableSectionErrorAction(action.payload.submissionId, action.payload.sectionId))));
    })),
  );

  saveDuplicateDecision$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SET_DUPLICATE_DECISION),
    switchMap((action: SetDuplicateDecisionAction) => {
      return this.operationsService.jsonPatchByResourceID(
        this.submissionService.getSubmissionObjectLinkName(),
        action.payload.submissionId,
        'sections',
        action.payload.sectionId).pipe(
        map((response: SubmissionObject[]) => new SetDuplicateDecisionSuccessAction(
          action.payload.submissionId,
          action.payload.sectionId,
          response),
        ),
        catchError(() => observableOf(new SetDuplicateDecisionErrorAction(action.payload.submissionId))));
    })),
  );

  setDuplicateDecisionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SET_DUPLICATE_DECISION_SUCCESS),
    tap(() => this.notificationsService.success(null, this.translate.get('submission.sections.detect-duplicate.decision-success-notice')))),
  { dispatch: false },
  );

  /**
   * Dispatch a [DepositSubmissionSuccessAction] or a [DepositSubmissionErrorAction] on error
   */
  depositSubmission$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.DEPOSIT_SUBMISSION),
    withLatestFrom(this.store$),
    switchMap(([action, state]: [DepositSubmissionAction, any]) => {
      return this.submissionService.depositSubmission(state.submission.objects[action.payload.submissionId].selfUrl).pipe(
        map(() => new DepositSubmissionSuccessAction(action.payload.submissionId)),
        catchError((error: unknown) => observableOf(new DepositSubmissionErrorAction(action.payload.submissionId))));
    })));

  /**
   * Show a notification on success and redirect to MyDSpace page
   */
  saveForLaterSubmissionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.SAVE_FOR_LATER_SUBMISSION_FORM_SUCCESS),
    tap(() => this.notificationsService.success(null, this.translate.get('submission.sections.general.save_success_notice'))),
    tap((action: SaveForLaterSubmissionFormSuccessAction) => {
      const scope = this.submissionService.getSubmissionScope();
      if (scope === SubmissionScopeType.EditItem) {
        this.submissionService.redirectToItemPage(action.payload.submissionId);
      } else {
        this.submissionService.redirectToMyDSpace();
      }
    })), { dispatch: false });

  /**
   * Show a notification on success and redirect to MyDSpace page
   */
  depositSubmissionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.DEPOSIT_SUBMISSION_SUCCESS),
    tap(() => this.notificationsService.success(null, this.translate.get('submission.sections.general.deposit_success_notice'))),
    tap((action: DepositSubmissionSuccessAction) => this.workspaceItemDataService.invalidateById(action.payload.submissionId)),
    tap(() => this.submissionService.redirectToMyDSpace())), { dispatch: false });

  /**
   * Show a notification on error
   */
  depositSubmissionError$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.DEPOSIT_SUBMISSION_ERROR),
    tap(() => this.notificationsService.error(null, this.translate.get('submission.sections.general.deposit_error_notice')))), { dispatch: false });

  /**
   * Dispatch a [DiscardSubmissionSuccessAction] or a [DiscardSubmissionErrorAction] on error
   */
  discardSubmission$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.DISCARD_SUBMISSION),
    switchMap((action: DepositSubmissionAction) => {
      return this.submissionService.discardSubmission(action.payload.submissionId).pipe(
        map(() => new DiscardSubmissionSuccessAction(action.payload.submissionId)),
        catchError(() => observableOf(new DiscardSubmissionErrorAction(action.payload.submissionId))));
    })));

  /**
   * Adds all metadata an item to the SubmissionForm sections of the submission
   */
  addAllMetadataToSectionData = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.UPDATE_SECTION_DATA),
    switchMap((action: UpdateSectionDataAction) => {
      return this.sectionService.getSectionState(action.payload.submissionId, action.payload.sectionId, SectionsType.Upload)
        .pipe(map((section: SubmissionSectionObject) => [action, section]), take(1));
    }),
    filter(([action, section]: [UpdateSectionDataAction, SubmissionSectionObject]) => section.sectionType === SectionsType.SubmissionForm),
    switchMap(([action, section]: [UpdateSectionDataAction, SubmissionSectionObject]) => {
      if (section.sectionType === SectionsType.SubmissionForm) {
        const submissionObject$ = this.submissionObjectService
          .findById(action.payload.submissionId, true, false, followLink('item')).pipe(
            getFirstSucceededRemoteDataPayload(),
          );

        const item$ = submissionObject$.pipe(
          switchMap((submissionObject: SubmissionObject) => (submissionObject.item as Observable<RemoteData<Item>>).pipe(
            getFirstSucceededRemoteDataPayload(),
          )));

        return item$.pipe(
          map((item: Item) => item.metadata),
          filter((metadata) => !isEqual(action.payload.data, metadata)),
          map((metadata: any) => new UpdateSectionDataAction(action.payload.submissionId, action.payload.sectionId, metadata, action.payload.errorsToShow, action.payload.serverValidationErrors, action.payload.metadata)),
        );
      } else {
        return observableOf(new UpdateSectionDataSuccessAction());
      }
    }),
  ));

  /**
   * Show a notification on success and redirect to MyDSpace page
   */
  discardSubmissionSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.DISCARD_SUBMISSION_SUCCESS),
    tap(() => this.notificationsService.success(null, this.translate.get('submission.sections.general.discard_success_notice'))),
    tap(() => this.submissionService.redirectToMyDSpace())), { dispatch: false });

  /**
   * Show a notification on error
   */
  discardSubmissionError$ = createEffect(() => this.actions$.pipe(
    ofType(SubmissionObjectActionTypes.DISCARD_SUBMISSION_ERROR),
    tap(() => this.notificationsService.error(null, this.translate.get('submission.sections.general.discard_error_notice')))), { dispatch: false });

  constructor(
    private actions$: Actions,
    private notificationsService: NotificationsService,
    private operationsService: SubmissionJsonPatchOperationsService,
    private sectionService: SectionsService,
    private store$: Store<any>,
    private submissionService: SubmissionService,
    private submissionObjectService: SubmissionObjectDataService,
    private translate: TranslateService,
    private workspaceItemDataService: WorkspaceitemDataService,
  ) {
  }

  /**
   * Check if the submission object retrieved from REST haven't section errors
   *
   * @param response
   *    The submission object retrieved from REST
   */
  protected canDeposit(response: SubmissionObject[]) {
    let canDeposit = true;

    if (isNotEmpty(response)) {
      response.forEach((item: WorkspaceItem | WorkflowItem) => {
        const { errors } = item;

        if (errors && !isEmpty(errors)) {
          canDeposit = false;
        }
      });
    }
    return canDeposit;
  }

  /**
   * Parse the submission object retrieved from REST and return actions to dispatch
   *
   * @param currentState
   *    The current SubmissionObjectEntry
   * @param response
   *    The submission object retrieved from REST
   * @param submissionId
   *    The submission id
   * @param forms
   *    The forms state
   * @param notify
   *    A boolean that indicate if show notification or not
   * @return SubmissionObjectAction[]
   *    List of SubmissionObjectAction to dispatch
   * @param showNotifications
   *    A boolean representing if to show notifications on save
   * @param showErrors
   *    A boolean representing if to show errors on save
   */
  protected parseSaveResponse(
    currentState: SubmissionObjectEntry,
    response: SubmissionObject[],
    submissionId: string,
    forms: FormState,
    showNotifications: boolean = true,
    showErrors: boolean = true): SubmissionObjectAction[] {

    const mappedActions = [];

    if (isNotEmpty(response)) {
      if (showNotifications) {
        this.notificationsService.success(null, this.translate.get('submission.sections.general.save_success_notice'));
      }

      response.forEach((item: WorkspaceItem | WorkflowItem) => {

        let errorsList = Object.create({});
        const { errors } = item;

        if (errors && !isEmpty(errors)) {
          // to avoid dispatching an action for every error, create an array of errors per section
          errorsList = parseSectionErrors(errors);
          if (showNotifications) {
            this.notificationsService.warning(null, this.translate.get('submission.sections.general.sections_not_valid'));
          }
        }

        const sections: WorkspaceitemSectionsObject = (item.sections && isNotEmpty(item.sections)) ? item.sections : {};
        const sectionsKeys: string[] = union(Object.keys(sections), Object.keys(errorsList));

        for (const sectionId of sectionsKeys) {
          const sectionErrors = errorsList[sectionId] || [];
          const sectionData = sections[sectionId] || {};

          // When Upload section is disabled, add to submission only if there are files
          if (currentState.sections[sectionId].sectionType === SectionsType.Upload
            && isEmpty((sectionData as WorkspaceitemSectionUploadObject).files)
            && !currentState.sections[sectionId].enabled) {
            continue;
          }

          if (showNotifications && !currentState.sections[sectionId].enabled) {
            this.submissionService.notifyNewSection(submissionId, sectionId, currentState.sections[sectionId].sectionType);
          }

          const sectionForm = getForm(forms, currentState, sectionId);
          const filteredErrors = filterErrors(sectionForm, sectionErrors, currentState.sections[sectionId].sectionType, showErrors);
          mappedActions.push(new UpdateSectionDataAction(submissionId, sectionId, sectionData, filteredErrors, sectionErrors));
        }

        // Sherpa Policies section needs to be updated when the rest response section is empty
        const sherpaPoliciesSectionId = findKey(currentState.sections, (section) => section.sectionType === SectionsType.SherpaPolicies);
        if (isNotUndefined(sherpaPoliciesSectionId) && isNotEmpty(currentState.sections[sherpaPoliciesSectionId]?.data)
          && isEmpty(sections[sherpaPoliciesSectionId])) {
          mappedActions.push(new UpdateSectionDataAction(submissionId, sherpaPoliciesSectionId, null, [], []));
        }

        // When Duplicate Detection step is enabled, add it only if there are duplicates in the response section data
        // or if configuration overrides this behaviour
        if (!alwaysDisplayDuplicates()) {
          const duplicatesSectionId = findKey(currentState.sections, (section) => section.sectionType === SectionsType.Duplicates);
          if (isNotUndefined(duplicatesSectionId) && sections.hasOwnProperty(duplicatesSectionId) && isEmpty((sections[duplicatesSectionId] as WorkspaceitemSectionDuplicatesObject).potentialDuplicates)) {
            mappedActions.push(new CleanDuplicateDetectionAction(submissionId));
          }
        }

        if (isNotEmpty((currentState.sections['detect-duplicate']?.data as WorkspaceitemSectionDetectDuplicateObject)?.matches)
          && isUndefined(sections['detect-duplicate'])) {
          mappedActions.push(new CleanDetectDuplicateAction(submissionId));
        }
      });
    }
    return mappedActions;
  }

  /**
   * Parse the error response retrieved from REST and return actions to dispatch
   *
   * @param isSaveForSection
   *    A boolean representing if save has been dispatched for a section or for the entire submission
   * @param errors
   *    The list of submission object error
   * @param submissionId
   *    The submission id
   * @param statusCode
   *    the submission's response error code
   * @param errorMessage
   *    the submission's response error message
   * @return SubmissionObjectAction[]
   *    List of SubmissionObjectAction to dispatch
   */
  protected parseErrorResponse(
    isSaveForSection: boolean,
    errors: SubmissionObjectError[],
    submissionId: string,
    statusCode: number,
    errorMessage: string,
  ): SubmissionObjectAction[] {

    const mappedActions = [];
    let errorsList = Object.create({});

    if (errors && isNotEmpty(errors)) {
      // to avoid dispatching an action for every error, create an array of errors per section
      errorsList = parseSectionErrors(errors);
    }

    if (isNotEmpty(errorsList)) {
      // Notify warning message
      this.notificationsService.warning(
        null,
        this.translate.get('submission.sections.general.invalid_state_error'),
        new NotificationOptions(10000),
      );

      // Dispatch actions to update section errors
      Object.keys(errorsList).forEach((sectionId) => {
        const sectionErrors = errorsList[sectionId] || [];
        mappedActions.push(new UpdateSectionErrorsAction(submissionId, sectionId, sectionErrors, sectionErrors));
      });
    } else {
      if (isSaveForSection) {
        mappedActions.push(new SaveSubmissionSectionFormErrorAction(submissionId, statusCode, errorMessage));
      } else {
        mappedActions.push(new SaveSubmissionFormErrorAction(submissionId, statusCode, errorMessage));
      }
    }

    return mappedActions;
  }
}

function getForm(forms, currentState, sectionId) {
  if (!forms) {
    return null;
  }
  const formId = currentState.sections[sectionId].formId;
  return forms[formId];
}

/**
 * Filter sectionErrors accordingly to this rules:
 * 1. if notifications are enabled return all errors
 * 2. if sectionType is different from 'submission-form' return all errors
 * 3. otherwise return errors only for those fields marked as touched inside the section form
 * @param sectionForm
 *  The form related to the section
 * @param sectionErrors
 *  The section errors array
 * @param sectionType
 *  The section type
 * @param notify
 *  Whether notifications are enabled
 */
function filterErrors(sectionForm: FormState, sectionErrors: SubmissionSectionError[], sectionType: string, notify: boolean): SubmissionSectionError[] {
  if (notify || sectionType !== SectionsType.SubmissionForm.valueOf()) {
    return sectionErrors;
  }
  if (!sectionForm || !sectionForm.touched) {
    return [];
  }
  const filteredErrors = [];
  sectionErrors.forEach((error: SubmissionSectionError) => {
    const errorPaths: SectionErrorPath[] = parseSectionErrorPaths(error.path);
    errorPaths.forEach((path: SectionErrorPath) => {
      if (path.fieldId && sectionForm.touched[path.fieldId]) {
        filteredErrors.push(error);
      }
    });
  });
  return filteredErrors;
}

function alwaysDisplayDuplicates(): boolean {
  return (environment.submission.duplicateDetection.alwaysShowSection);
}
