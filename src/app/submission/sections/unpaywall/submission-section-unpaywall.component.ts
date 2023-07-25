import { Component, Inject, OnDestroy } from '@angular/core';
import { renderSectionFor } from '../sections-decorator';
import { SectionsType } from '../sections-type';
import { SectionModelComponent } from '../models/section.model';
import { SectionDataObject } from '../models/section-data.model';
import { SectionsService } from '../sections.service';
import { BehaviorSubject, forkJoin, interval, mergeMap, Observable, of, Subject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { SubmissionState } from '../../submission.reducers';
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { SubmissionObjectEntry } from '../../objects/submission-objects.reducer';
import { UpdateSectionVisibilityAction } from '../../objects/submission-objects.actions';
import {
  WorkspaceitemSectionUnpaywallObject
} from '../../../core/submission/models/workspaceitem-section-unpaywall-object';
import { UnpaywallSectionStatus } from './models/unpaywall-section-status';
import { FileUploader } from 'ng2-file-upload';
import { HALEndpointService } from '../../../core/shared/hal-endpoint.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SubmissionService } from '../../submission.service';
import { HttpXsrfTokenExtractor } from '@angular/common/http';
import { XSRF_REQUEST_HEADER } from '../../../core/xsrf/xsrf.interceptor';
import { WorkspaceItem } from '../../../core/submission/models/workspaceitem.model';
import { normalizeSectionData } from '../../../core/submission/submission-response-parsing.service';
import { hasValue, isEmpty, isNotEmpty } from '../../../shared/empty.util';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import parseSectionErrors from '../../utils/parseSectionErrors';
import { TranslateService } from '@ngx-translate/core';
import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import {
  SubmissionVisibilityType,
  SubmissionVisibilityValue
} from '../../../core/config/models/config-submission-section.model';
import { SubmissionScopeType } from '../../../core/submission/submission-scope-type';
import { submissionObjectFromIdSelector } from '../../selectors';
import { DspaceRestService } from '../../../core/dspace-rest/dspace-rest.service';
import { RestRequestMethod } from '../../../core/data/rest-request-method';
import { Operation } from 'fast-json-patch';
import { ResourceService } from '../../../core/services/resource.service';
import { UnpaywallApi } from './models/unpaywall-api';

const DOI_METADATA = 'dc.identifier.doi';
const API_CHECK_INTERVAL = 3000;

/**
 * This component represents a section that contains the submission unpaywall integration.
 */
@Component({
  selector: 'ds-submission-section-unpaywall-component',
  templateUrl: './submission-section-unpaywall.component.html',
  styleUrls: ['./submission-section-unpaywall.component.scss']
})
@renderSectionFor(SectionsType.Unpaywall)
export class SubmissionSectionUnpaywallComponent extends SectionModelComponent implements OnDestroy {

  public readonly UnpaywallSectionStatus = UnpaywallSectionStatus;
  public readonly status$ = new BehaviorSubject<UnpaywallSectionStatus>(null);
  public readonly loading$ = new BehaviorSubject<boolean>(true);
  public readonly section$ = new BehaviorSubject<WorkspaceitemSectionUnpaywallObject>(null);
  private readonly unsubscribe$ = new Subject<void>();
  private checkIntervalSubscription: Subscription;
  readonly uploader = new FileUploader({ autoUpload: false });

  constructor(
    protected sectionService: SectionsService,
    private store: Store<SubmissionState>,
    private halService: HALEndpointService,
    private authService: AuthService,
    private submissionService: SubmissionService,
    private tokenExtractor: HttpXsrfTokenExtractor,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private resourceService: ResourceService,
    private restApi: DspaceRestService,
    @Inject('collectionIdProvider') public injectedCollectionId: string,
    @Inject('sectionDataProvider') public injectedSectionData: SectionDataObject,
    @Inject('submissionIdProvider') public injectedSubmissionId: string
  ) {
    super(
      injectedCollectionId,
      injectedSectionData,
      injectedSubmissionId,
    );
  }

  protected onSectionInit(): void {
    this.store.select(submissionObjectFromIdSelector(this.submissionId))
      .pipe(
        takeUntil(this.unsubscribe$),
        map(value => this.getDoiMetadataValue(value)),
        distinctUntilChanged(),
      )
      .subscribe(doiValue => !!doiValue ? this.showCurrentSection() : this.hideCurrentSection());
  }

  protected onSectionDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public refreshApiCheck(): void {
    this.startApiCheck(true);
  }

  public uploadFileIfNeeded(): void {
    if (this.section$.getValue()?.status === UnpaywallSectionStatus.SUCCESSFUL) {
      this.loading$.next(true);
      const fileUrl = this.getFileUrl();
      if (fileUrl) {
        const fileName = fileUrl.split('/').pop();
        forkJoin([
          this.resourceService.download(fileUrl),
          this.halService.getEndpoint(this.submissionService.getSubmissionObjectLinkName())
        ]).pipe(
          takeUntil(this.unsubscribe$),
          map(([fileBlob, endpoint]) => {
            const file = new File([fileBlob], fileName);
            this.uploader.setOptions({
              url: endpoint.concat(`/${this.submissionId}`),
              authToken: this.authService.buildAuthHeader(),
              autoUpload: false,
              headers: [{ name: XSRF_REQUEST_HEADER, value: this.tokenExtractor.getToken() }]
            });
            return file;
          }),
          mergeMap((file) => this.uploadFile(file))
        ).subscribe(() => this.loading$.next(false));
      }
    }
  }

  private startApiCheck(refreshRequired = false): void {
    this.loading$.next(true);
    if (this.checkIntervalSubscription && !this.checkIntervalSubscription.closed) {
      this.checkIntervalSubscription.unsubscribe();
    }
    this.checkIntervalSubscription = interval(API_CHECK_INTERVAL)
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.checkApi(refreshRequired)),
        filter(hasValue)
      )
      .subscribe(section => {
        this.section$.next(section);
        this.status$.next(section.status);

        const isLoading = !section?.status || section?.status === UnpaywallSectionStatus.PENDING;
        this.loading$.next(isLoading);
        if (!isLoading) {
          this.stopApiCheck();
        }
      });
  }

  private stopApiCheck(): void {
    this.loading$.next(false);
    if (this.checkIntervalSubscription) {
      this.checkIntervalSubscription.unsubscribe();
    }
  }

  private checkApi(refreshRequired = false): Observable<WorkspaceitemSectionUnpaywallObject> {
    const pathCombiner = new JsonPatchOperationPathCombiner('sections', this.sectionData.id);
    const path = pathCombiner.getPath('refresh');
    const operation = { op: 'add', path: path.path, value: refreshRequired } as Operation;
    const linkPath = this.submissionService.getSubmissionObjectLinkName();
    return this.halService.getEndpoint(linkPath)
      .pipe(
        takeUntil(this.unsubscribe$),
        map((endpoint: string) => endpoint.concat(`/${this.submissionId}`)),
        mergeMap((endpoint: string) => this.restApi.request(RestRequestMethod.PATCH, endpoint, [operation])),
        map(response => response.payload?.sections?.unpaywall as WorkspaceitemSectionUnpaywallObject)
      );
  }

  private getDoiMetadataValue(value: SubmissionObjectEntry): string {
    return value.sections[value.definition]?.data?.[DOI_METADATA]?.[0]?.value;
  }

  private hideCurrentSection(): void {
    this.stopApiCheck();
    this.store.dispatch(new UpdateSectionVisibilityAction(this.submissionId, this.injectedSectionData.id, {
      [SubmissionScopeType.WorkspaceItem]: SubmissionVisibilityValue.Hidden,
      [SubmissionScopeType.EditItem]: SubmissionVisibilityValue.Hidden,
      [SubmissionScopeType.WorkflowItem]: SubmissionVisibilityValue.Hidden
    } as SubmissionVisibilityType));
  }

  private showCurrentSection(): void {
    this.startApiCheck();
    this.store.dispatch(new UpdateSectionVisibilityAction(this.submissionId, this.injectedSectionData.id, null));
  }

  private getFileUrl(): string {
    return (JSON.parse(this.section$.getValue()?.jsonRecord) as UnpaywallApi)?.best_oa_location?.url;
  }

  private uploadFile(file: File): Observable<void> {
    const onSuccessItem$ = new BehaviorSubject<WorkspaceItem>(null);
    onSuccessItem$.pipe(
      filter(hasValue),
      takeUntil(this.unsubscribe$)
    ).subscribe(workspaceItem => this.updateUploadSection(workspaceItem));
    this.uploader.onSuccessItem = (item, response) => onSuccessItem$.next(JSON.parse(response) as WorkspaceItem);
    this.uploader.addToQueue([file]);
    this.uploader.uploadAll();
    return onSuccessItem$.asObservable().pipe(filter(hasValue));
  }

  private updateUploadSection(workspaceItem: WorkspaceItem): void {
    const sections = workspaceItem.sections;
    const errors = workspaceItem.errors;
    const errorsList = parseSectionErrors(errors);
    if (sections && isNotEmpty(sections)) {
      Object.keys(sections).forEach((sectionId) => {
        const sectionData = normalizeSectionData(sections[sectionId]);
        const sectionErrors = errorsList[sectionId];
        this.sectionService.isSectionType(this.submissionId, sectionId, SectionsType.Upload)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((isUpload) => {
            if (isUpload) {
              this.sectionService.updateSectionData(this.submissionId, sectionId, sectionData, sectionErrors, sectionErrors);
              if ((isEmpty(sectionErrors))) {
                this.notificationsService
                  .success(null, this.translate.get('submission.sections.upload.upload-successful'));
              } else {
                this.notificationsService.error(null, this.translate.get('submission.sections.upload.upload-failed'));
              }
            }
          });
      });
    }
    this.uploader.clearQueue();
  }

  protected getSectionStatus(): Observable<boolean> {
    return of(true);
  }

}
