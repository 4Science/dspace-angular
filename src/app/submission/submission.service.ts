import {
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  createSelector,
  MemoizedSelector,
  select,
  Store,
} from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
  ScrollToConfigOptions,
  ScrollToService,
} from '@nicky-lenaers/ngx-scroll-to';
import {
  Observable,
  of as observableOf,
  Subscription,
  timer as observableTimer,
} from 'rxjs';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  filter,
  find,
  map,
  startWith,
  take,
  tap,
} from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ErrorResponse } from '../core/cache/response.models';
import { SubmissionDefinitionsModel } from '../core/config/models/config-submission-definitions.model';
import { RemoteData } from '../core/data/remote-data';
import { RequestService } from '../core/data/request.service';
import { HttpOptions } from '../core/dspace-rest/dspace-rest.service';
import { RouteService } from '../core/services/route.service';
import { Item } from '../core/shared/item.model';
import { SearchService } from '../core/shared/search/search.service';
import { MetadataSecurityConfiguration } from '../core/submission/models/metadata-security-configuration';
import { SubmissionObject } from '../core/submission/models/submission-object.model';
import { WorkspaceitemSectionsObject } from '../core/submission/models/workspaceitem-sections.model';
import { SubmissionJsonPatchOperationsService } from '../core/submission/submission-json-patch-operations.service';
import { SubmissionRestService } from '../core/submission/submission-rest.service';
import { SubmissionScopeType } from '../core/submission/submission-scope-type';
import {
  hasValue,
  isEmpty,
  isNotEmpty,
  isNotUndefined,
} from '../shared/empty.util';
import { NotificationOptions } from '../shared/notifications/models/notification-options.model';
import { NotificationsService } from '../shared/notifications/notifications.service';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject,
} from '../shared/remote-data.utils';
import { SubmissionError } from './objects/submission-error.model';
import {
  CancelSubmissionFormAction,
  ChangeSubmissionCollectionAction,
  DiscardSubmissionAction,
  InitSubmissionFormAction,
  ResetSubmissionFormAction,
  SaveAndDepositSubmissionAction,
  SaveForLaterSubmissionFormAction,
  SaveSubmissionFormAction,
  SaveSubmissionSectionFormAction,
  SetActiveSectionAction,
} from './objects/submission-objects.actions';
import {
  SubmissionObjectEntry,
  SubmissionSectionEntry,
} from './objects/submission-objects.reducer';
import { SubmissionSectionObject } from './objects/submission-section-object.model';
import { SectionDataObject } from './sections/models/section-data.model';
import { SectionsType } from './sections/sections-type';
import {
  securityConfigurationObjectFromIdSelector,
  submissionObjectFromIdSelector,
} from './selectors';
import {
  submissionSelector,
  SubmissionState,
} from './submission.reducers';
import { SubmissionVisibility } from './utils/visibility.util';

function getSubmissionSelector(submissionId: string):  MemoizedSelector<SubmissionState, SubmissionObjectEntry> {
  return createSelector(
    submissionSelector,
    (state: SubmissionState) => state.objects[submissionId],
  );
}

function getSubmissionCollectionIdSelector(submissionId: string): MemoizedSelector<SubmissionState, string> {
  return createSelector(
    getSubmissionSelector(submissionId),
    (submission: SubmissionObjectEntry) => submission?.collection,
  );
}

/**
 * A service that provides methods used in submission process.
 */
@Injectable({ providedIn: 'root' })
export class SubmissionService {

  /**
   * Subscription
   */
  protected autoSaveSub: Subscription;

  /**
   * Observable used as timer
   */
  protected timer$: Observable<any>;

  private workspaceLinkPath = 'workspaceitems';
  private workflowLinkPath = 'workflowitems';
  private editItemsLinkPath = 'edititems';

  /**
   * Initialize service variables
   * @param {NotificationsService} notificationsService
   * @param {SubmissionRestService} restService
   * @param {Router} router
   * @param {RouteService} routeService
   * @param {ScrollToService} scrollToService
   * @param {Store<SubmissionState>} store
   * @param {TranslateService} translate
   * @param {SearchService} searchService
   * @param {RequestService} requestService
   * @param {SubmissionJsonPatchOperationsService} jsonPatchOperationService
   */
  constructor(protected notificationsService: NotificationsService,
              protected restService: SubmissionRestService,
              protected router: Router,
              protected routeService: RouteService,
              protected scrollToService: ScrollToService,
              protected store: Store<SubmissionState>,
              protected translate: TranslateService,
              protected searchService: SearchService,
              protected requestService: RequestService,
              protected jsonPatchOperationService: SubmissionJsonPatchOperationsService) {
  }

  /**
   * Dispatch a new [ChangeSubmissionCollectionAction]
   *
   * @param submissionId
   *    The submission id
   * @param collectionId
   *    The collection id
   */
  changeSubmissionCollection(submissionId: string, collectionId: string): void {
    this.store.dispatch(new ChangeSubmissionCollectionAction(submissionId, collectionId));
  }

  /**
   * Listen to collection changes for a certain {@link SubmissionObject}
   *
   * @param submissionId The submission id
   */
  getSubmissionCollectionId(submissionId: string): Observable<string> {
    return this.store.pipe(select(getSubmissionCollectionIdSelector(submissionId)));
  }

  /**
   * Perform a REST call to create a new workspaceitem and return response
   *
   * @param collectionId
   *    The owning collection id
   * @param entityType
   *    The entity type
   * @return Observable<SubmissionObject>
   *    observable of SubmissionObject
   */
  createSubmission(collectionId?: string, entityType?: string): Observable<SubmissionObject> {
    const paramsObj = Object.create({});

    if (isNotEmpty(entityType)) {
      paramsObj.entityType = entityType;
    }

    const params = new HttpParams({ fromObject: paramsObj });
    const options: HttpOptions = Object.create({});
    options.params = params;
    return this.restService.postToEndpoint(this.workspaceLinkPath, {}, null, options, collectionId).pipe(
      map((workspaceitem: SubmissionObject[]) => workspaceitem[0] as SubmissionObject),
      catchError(() => observableOf({} as SubmissionObject)));
  }

  /**
   * Perform a REST call to create a new workspaceitem for a specified collection and return response
   *
   * @param collectionId
   *    The collection id
   * @return Observable<SubmissionObject>
   *    observable of SubmissionObject
   */
  createSubmissionForCollection(collectionId: string): Observable<SubmissionObject> {
    const paramsObj = Object.create({});

    if (isNotEmpty(collectionId)) {
      paramsObj.collection = collectionId;
    }

    const params = new HttpParams({ fromObject: paramsObj });
    const options: HttpOptions = Object.create({});
    options.params = params;

    return this.restService.postToEndpoint(this.workspaceLinkPath, {}, null, options).pipe(
      map((workspaceitem: SubmissionObject[]) => workspaceitem[0] as SubmissionObject),
      catchError(() => observableOf({} as SubmissionObject)));
  }

  /**
   * Perform a REST call to deposit a workspaceitem and return response
   *
   * @param selfUrl
   *    The workspaceitem self url
   * @param collectionId
   *    Optional collection id
   * @return Observable<SubmissionObject>
   *    observable of SubmissionObject
   */
  createSubmissionFromExternalSource(selfUrl: string, collectionId?: string): Observable<SubmissionObject[]> {
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;
    return this.restService.postToEndpoint(this.workspaceLinkPath, selfUrl, null, options, collectionId) as Observable<SubmissionObject[]>;
  }

  /**
   * Perform a REST call to create a new workspaceitem by item and return response
   *
   * @return Observable<SubmissionObject>
   *    observable of SubmissionObject
   */
  createSubmissionByItem(itemId: string, relationshipName?: string): Observable<SubmissionObject> {
    const paramsObj = Object.create({});

    if (isNotEmpty(itemId)) {
      paramsObj.item = itemId;
    }
    if (isNotEmpty(relationshipName)) {
      paramsObj.relationship = relationshipName;
    }

    const params = new HttpParams({ fromObject: paramsObj });
    const options: HttpOptions = Object.create({});
    options.params = params;

    return this.restService.postToEndpoint(this.workspaceLinkPath, {}, null, options).pipe(
      map((workspaceitem: SubmissionObject[]) => workspaceitem[0] as SubmissionObject));
  }

  /**
   * Perform a REST call to deposit a workspaceitem and return response
   *
   * @param selfUrl
   *    The workspaceitem self url
   * @return Observable<SubmissionObject>
   *    observable of SubmissionObject
   */
  depositSubmission(selfUrl: string): Observable<SubmissionObject[]> {
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;
    return this.restService.postToEndpoint(this.workflowLinkPath, selfUrl, null, options) as Observable<SubmissionObject[]>;
  }

  /**
   * Perform a REST call to delete a workspaceitem and return response
   *
   * @param submissionId
   *    The submission id
   * @return Observable<SubmissionObject>
   *    observable of SubmissionObject
   */
  discardSubmission(submissionId: string): Observable<SubmissionObject[]> {
    return this.restService.deleteById(submissionId) as Observable<SubmissionObject[]>;
  }

  /**
   * Dispatch a new [InitSubmissionFormAction]
   *
   * @param collectionId
   *    The collection id
   * @param submissionId
   *    The submission id
   * @param selfUrl
   *    The workspaceitem self url
   * @param submissionDefinition
   *    The [SubmissionDefinitionsModel] that define submission configuration
   * @param sections
   *    The [WorkspaceitemSectionsObject] that define submission sections init data
   * @param item
   * @param errors
   *    The [SubmissionSectionError] that define submission sections init errors
   * @param metadataSecurityConfiguration
   */
  dispatchInit(
    collectionId: string,
    submissionId: string,
    selfUrl: string,
    submissionDefinition: SubmissionDefinitionsModel,
    sections: WorkspaceitemSectionsObject,
    item: Item,
    errors: SubmissionError,
    metadataSecurityConfiguration?: MetadataSecurityConfiguration) {
    this.store.dispatch(new InitSubmissionFormAction(collectionId, submissionId, selfUrl, submissionDefinition, sections, item, errors, metadataSecurityConfiguration));
  }

  /**
   * Dispatch a new [SaveAndDepositSubmissionAction]
   *
   * @param submissionId
   *    The submission id
   */
  dispatchDeposit(submissionId) {
    this.store.dispatch(new SaveAndDepositSubmissionAction(submissionId));
  }

  /**
   * Dispatch a new [DiscardSubmissionAction]
   *
   * @param submissionId
   *    The submission id
   */
  dispatchDiscard(submissionId) {
    this.store.dispatch(new DiscardSubmissionAction(submissionId));
  }

  /**
   * Dispatch a new [SaveSubmissionFormAction]
   *
   * @param submissionId
   *    The submission id
   * @param manual
   *    whether is a manual save, default false
   */
  dispatchSave(submissionId, manual?: boolean) {
    this.getSubmissionSaveProcessingStatus(submissionId).pipe(
      find((isPending: boolean) => !isPending),
    ).subscribe(() => {
      this.store.dispatch(new SaveSubmissionFormAction(submissionId, manual));
    });
  }

  /**
   * Dispatch a new [SaveForLaterSubmissionFormAction]
   *
   * @param submissionId
   *    The submission id
   */
  dispatchSaveForLater(submissionId) {
    this.store.dispatch(new SaveForLaterSubmissionFormAction(submissionId));
  }

  /**
   * Dispatch a new [SaveSubmissionSectionFormAction]
   *
   * @param submissionId
   *    The submission id
   * @param sectionId
   *    The section id
   */
  dispatchSaveSection(submissionId, sectionId) {
    this.store.dispatch(new SaveSubmissionSectionFormAction(submissionId, sectionId));
  }

  /**
   * Return the id of the current focused section for the specified submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<string>
   *    observable of section id
   */
  getActiveSectionId(submissionId: string): Observable<string> {
    return this.getSubmissionObject(submissionId).pipe(
      map((submission: SubmissionObjectEntry) => submission.activeSection));
  }

  /**
   * Return the [SubmissionObjectEntry] for the specified submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<SubmissionObjectEntry>
   *    observable of SubmissionObjectEntry
   */
  getSubmissionObject(submissionId: string): Observable<SubmissionObjectEntry> {
    return this.store.select(submissionObjectFromIdSelector(submissionId)).pipe(
      filter((submission: SubmissionObjectEntry) => isNotUndefined(submission)));
  }

  /**
   * Return the [MetadataSecurityConfiguration] for the specified submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<MetadataSecurityConfiguration>
   *    observable of MetadataSecurityConfiguration
   */
  getSubmissionSecurityConfiguration(submissionId: string): Observable<MetadataSecurityConfiguration> {
    return this.store.select(securityConfigurationObjectFromIdSelector(submissionId)).pipe(
      filter((securityConfiguration: MetadataSecurityConfiguration) => isNotUndefined(securityConfiguration)));
  }

  /**
   * Return a list of the active [SectionDataObject] belonging to the specified submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<SubmissionObjectEntry>
   *    observable with the list of active submission's sections
   */
  getSubmissionSections(submissionId: string): Observable<SectionDataObject[]> {
    return this.getSubmissionObject(submissionId).pipe(
      find((submission: SubmissionObjectEntry) => isNotUndefined(submission.sections) && !submission.isLoading),
      map((submission: SubmissionObjectEntry) => submission.sections),
      map((sections: SubmissionSectionEntry) => {
        const availableSections: SectionDataObject[] = [];
        Object.keys(sections)
          .filter((sectionId) => !this.isSectionHidden(sections[sectionId] as SubmissionSectionObject))
          .forEach((sectionId) => {
            const sectionObject: SectionDataObject = Object.create({});
            sectionObject.config = sections[sectionId].config;
            sectionObject.mandatory = sections[sectionId].mandatory;
            sectionObject.opened = sections[sectionId].opened;
            sectionObject.data = sections[sectionId].data;
            sectionObject.errorsToShow = sections[sectionId].errorsToShow;
            sectionObject.serverValidationErrors = sections[sectionId].serverValidationErrors;
            sectionObject.header = sections[sectionId].header;
            sectionObject.id = sectionId;
            sectionObject.sectionType = sections[sectionId].sectionType;
            sectionObject.sectionVisibility = sections[sectionId].visibility;
            availableSections.push(sectionObject);
          });
        return availableSections;
      }),
      startWith([]),
      distinctUntilChanged());
  }

  /**
   * Return a list of the disabled [SectionDataObject] belonging to the specified submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<SubmissionObjectEntry>
   *    observable with the list of disabled submission's sections
   */
  getDisabledSectionsList(submissionId: string): Observable<SectionDataObject[]> {
    return this.getSubmissionObject(submissionId).pipe(
      filter((submission: SubmissionObjectEntry) => isNotUndefined(submission.sections) && !submission.isLoading),
      map((submission: SubmissionObjectEntry) => submission.sections),
      map((sections: SubmissionSectionEntry) => {
        const disabledSections: SectionDataObject[] = [];
        Object.keys(sections)
          .filter((sectionId) => !this.isSectionHidden(sections[sectionId] as SubmissionSectionObject))
          .filter((sectionId) => !sections[sectionId].enabled)
          .filter((sectionId) => sections[sectionId].sectionType !== SectionsType.DetectDuplicate)
          .forEach((sectionId) => {
            const sectionObject: SectionDataObject = Object.create({});
            sectionObject.header = sections[sectionId].header;
            sectionObject.id = sectionId;
            disabledSections.push(sectionObject);
          });
        return disabledSections;
      }),
      startWith([]),
      distinctUntilChanged());
  }

  /**
   * Return the correct REST endpoint link path depending on the page route
   *
   * @return string
   *    link path
   */
  getSubmissionObjectLinkName(): string {
    const url = this.router.routerState.snapshot.url;
    if (url.startsWith('/workspaceitems') || url.startsWith('/submit')) {
      return this.workspaceLinkPath;
    } else if (url.startsWith('/workflowitems')) {
      return this.workflowLinkPath;
    } else {
      return this.editItemsLinkPath;
    }
  }

  /**
   * Return the submission scope
   *
   * @return SubmissionScopeType
   *    the SubmissionScopeType
   */
  getSubmissionScope(): SubmissionScopeType {
    let scope: SubmissionScopeType;
    switch (this.getSubmissionObjectLinkName()) {
      case this.workspaceLinkPath:
        scope = SubmissionScopeType.WorkspaceItem;
        break;
      case this.workflowLinkPath:
        scope = SubmissionScopeType.WorkflowItem;
        break;
      case this.editItemsLinkPath:
        scope = SubmissionScopeType.EditItem;
        break;
    }
    return scope;
  }

  /**
   * Return the validity status of the submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<boolean>
   *    observable with submission validity status
   */
  getSubmissionStatus(submissionId: string): Observable<boolean> {
    return this.store.select(submissionSelector).pipe(
      map((submissions: SubmissionState) => submissions.objects[submissionId]),
      filter((item) => isNotUndefined(item) && isNotUndefined(item.sections)),
      map((item) => item.sections),
      map((sections) => {
        const states = [];

        if (isNotUndefined(sections)) {
          Object.keys(sections)
            .filter((sectionId) => sections.hasOwnProperty(sectionId))
            .filter((sectionId) => !this.isSectionHidden(sections[sectionId] as SubmissionSectionObject))
            .filter((sectionId) => sections[sectionId].enabled)
            .filter((sectionId) => sections[sectionId].isValid === false)
            .forEach((sectionId) => {
              states.push(sections[sectionId].isValid);
            });
        }

        return !isEmpty(sections) && isEmpty(states);
      }),
      distinctUntilChanged(),
      startWith(false));
  }

  /**
   * Return the save processing status of the submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<boolean>
   *    observable with submission save processing status
   */
  getSubmissionSaveProcessingStatus(submissionId: string): Observable<boolean> {
    return this.getSubmissionObject(submissionId).pipe(
      map((state: SubmissionObjectEntry) => state.savePending),
      distinctUntilChanged(),
      startWith(false));
  }

  /**
   * Return the deposit processing status of the submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<boolean>
   *    observable with submission deposit processing status
   */
  getSubmissionDepositProcessingStatus(submissionId: string): Observable<boolean> {
    return this.getSubmissionObject(submissionId).pipe(
      map((state: SubmissionObjectEntry) => state.depositPending),
      distinctUntilChanged(),
      startWith(false));
  }

  /**
   * Return the save-decision status of the submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<boolean>
   *    observable with submission save-decision status
   */
  getSubmissionDuplicateDecisionProcessingStatus(submissionId: string): Observable<boolean> {
    return this.getSubmissionObject(submissionId).pipe(
      map((state: SubmissionObjectEntry) => state.saveDecisionPending),
      distinctUntilChanged(),
      startWith(false));
  }

  /**
   * Return whether submission unsaved modification are present
   *
   * @return Observable<boolean>
   *    observable with submission unsaved modification presence
   */
  hasUnsavedModification(): Observable<boolean> {
    return this.jsonPatchOperationService.hasPendingOperations('sections');
  }

  /**
   * Return the hidden visibility status of the specified section
   *
   * @param sectionData
   *    The section data
   * @return boolean
   *    true if section is hidden, false otherwise
   */
  private isSectionHidden(sectionData: SubmissionSectionObject): boolean {
    const scope = this.getSubmissionScope();
    return SubmissionVisibility.isHidden(sectionData.visibility, scope);
  }

  /**
   * Return the loading status of the submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<boolean>
   *    observable with submission loading status
   */
  isSubmissionLoading(submissionId: string): Observable<boolean> {
    return this.getSubmissionObject(submissionId).pipe(
      map((submission: SubmissionObjectEntry) => submission.isLoading),
      distinctUntilChanged());
  }

  /**
   * Return the discard status of the submission
   *
   * @param submissionId
   *    The submission id
   * @return Observable<boolean>
   *    observable with submission discard status
   */
  isSubmissionDiscarding(submissionId: string): Observable<boolean> {
    return this.store.select(submissionObjectFromIdSelector(submissionId)).pipe(
      map((submission: SubmissionObjectEntry) => isEmpty(submission) || submission?.isDiscarding),
      distinctUntilChanged(),
    );
  }

  /**
   * Show a notification when a new section is added to submission form
   *
   * @param submissionId
   *    The submission id
   * @param sectionId
   *    The section id
   * @param sectionType
   *    The section type
   */
  notifyNewSection(submissionId: string, sectionId: string, sectionType?: SectionsType) {
    if (sectionType === SectionsType.DetectDuplicate || sectionId === 'detect-duplicate') {
      this.setActiveSection(submissionId, sectionId);
      const msg = this.translate.instant('submission.sections.detect-duplicate.duplicate-detected', { sectionId });
      this.notificationsService.warning(null, msg, new NotificationOptions(10000));
      const config: ScrollToConfigOptions = {
        target: sectionId,
        offset: -70,
      };

      this.scrollToService.scrollTo(config);
    } else {
      const m = this.translate.instant('submission.sections.general.metadata-extracted-new-section', { sectionId });
      this.notificationsService.info(null, m, null, true);
    }
  }

  /**
   * Redirect to MyDspace page
   */
  redirectToMyDSpace() {
    // This assures that the cache is empty before redirecting to mydspace.
    // See https://github.com/DSpace/dspace-angular/pull/468
    this.searchService.getEndpoint().pipe(
      take(1),
      tap((url) => this.requestService.removeByHrefSubstring(url)),
      // Now, do redirect.
      concatMap(
        () => this.routeService.getPreviousUrl().pipe(
          take(1),
          tap((previousUrl) => {
            if (isEmpty(previousUrl) || !previousUrl.startsWith('/mydspace')) {
              this.router.navigate(['/mydspace']);
            } else {
              this.router.navigateByUrl(previousUrl);
            }
          }))),
    ).subscribe();
  }

  /**
   * Redirect to Item page
   */
  redirectToItemPage(submissionId: string) {
    const itemUuid = submissionId.indexOf(':') > -1 ? submissionId.split(':')[0] : submissionId;
    // TODO temporary disable because it causes an issue on item saving, check if it can be enable again after merge with 7.3
    // This assures that the cache is empty before redirecting to item page.
    // this.requestService.setStaleByHrefSubstring(`items/${itemUuid}`);

    this.router.navigateByUrl('/items/' + itemUuid, { replaceUrl: true });
  }

  /**
   * Dispatch a new [CancelSubmissionFormAction]
   */
  resetAllSubmissionObjects() {
    this.store.dispatch(new CancelSubmissionFormAction());
  }

  /**
   * Dispatch a new [ResetSubmissionFormAction]
   *
   * @param collectionId
   *    The collection id
   * @param submissionId
   *    The submission id
   * @param selfUrl
   *    The workspaceitem self url
   * @param submissionDefinition
   *    The [SubmissionDefinitionsModel] that define submission configuration
   * @param sections
   *    The [WorkspaceitemSectionsObject] that define submission sections init data
   * @param item
   * @param metadataSecurityConfiguration
   */
  resetSubmissionObject(
    collectionId: string,
    submissionId: string,
    selfUrl: string,
    submissionDefinition: SubmissionDefinitionsModel,
    sections: WorkspaceitemSectionsObject,
    item: Item,
    metadataSecurityConfiguration: MetadataSecurityConfiguration = null,
  ) {
    this.store.dispatch(new ResetSubmissionFormAction(collectionId, submissionId, selfUrl, sections, submissionDefinition, item, metadataSecurityConfiguration));
  }

  /**
   * Perform a REST call to retrieve an existing workspaceitem/workflowitem and return response
   *
   * @return Observable<RemoteData<SubmissionObject>>
   *    observable of RemoteData<SubmissionObject>
   */
  retrieveSubmission(submissionId, projections: string[] = []): Observable<RemoteData<SubmissionObject>> {
    return this.restService.getDataById(this.getSubmissionObjectLinkName(), submissionId, false, projections).pipe(
      find((submissionObjects: SubmissionObject[]) => isNotUndefined(submissionObjects)),
      map((submissionObjects: SubmissionObject[]) => createSuccessfulRemoteDataObject(
        submissionObjects[0])),
      catchError((errorResponse: unknown) => {
        if (errorResponse instanceof ErrorResponse) {
          return createFailedRemoteDataObject$<SubmissionObject>(errorResponse.errorMessage, errorResponse.statusCode);
        }
      }),
    );
  }

  /**
   * Dispatch a new [SetActiveSectionAction]
   *
   * @param submissionId
   *    The submission id
   * @param sectionId
   *    The section id
   */
  setActiveSection(submissionId, sectionId) {
    this.store.dispatch(new SetActiveSectionAction(submissionId, sectionId));
  }

  /**
   * Allow to save automatically the submission
   *
   * @param submissionId
   *    The submission id
   */
  startAutoSave(submissionId) {
    this.stopAutoSave();
    if (environment.submission.autosave.timer === 0) {
      return;
    }

    // AUTOSAVE submission
    const duration = environment.submission.autosave.timer;
    // Dispatch save action after given duration
    this.timer$ = observableTimer(duration, duration);
    this.autoSaveSub = this.timer$
      .subscribe(() => this.store.dispatch(new SaveSubmissionFormAction(submissionId)));
  }

  /**
   * Unsubscribe subscription to timer
   */
  stopAutoSave() {
    if (hasValue(this.autoSaveSub)) {
      this.autoSaveSub.unsubscribe();
      this.autoSaveSub = null;
    }
  }
}
