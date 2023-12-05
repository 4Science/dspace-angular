import { Component, Inject, OnDestroy } from '@angular/core';
import { renderSectionFor } from '../sections-decorator';
import { SectionsType } from '../sections-type';
import { SectionModelComponent } from '../models/section.model';
import { SectionDataObject } from '../models/section-data.model';
import { SectionsService } from '../sections.service';
import { BehaviorSubject, mergeMap, Observable, of, race, scan, Subject, timer } from 'rxjs';
import { Store } from '@ngrx/store';
import { SubmissionState } from '../../submission.reducers';
import {
  catchError,
  distinctUntilChanged,
  filter,
  last,
  map,
  pairwise,
  switchMap,
  take,
  takeUntil,
  takeWhile,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { SubmissionObjectEntry } from '../../objects/submission-objects.reducer';
import { UpdateSectionVisibilityAction } from '../../objects/submission-objects.actions';
import {
  WorkspaceitemSectionUnpaywallObject
} from '../../../core/submission/models/workspaceitem-section-unpaywall-object';
import { UnpaywallSectionStatus } from './models/unpaywall-section-status';
import { HALEndpointService } from '../../../core/shared/hal-endpoint.service';
import { SubmissionService } from '../../submission.service';
import { hasNoValue, hasValue } from '../../../shared/empty.util';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
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
import { AlertType } from '../../../shared/alert/alert-type';
import { MonoTypeOperatorFunction } from 'rxjs/internal/types';
import { SectionUploadService } from '../upload/section-upload.service';
import { WorkspaceitemSectionsObject } from '../../../core/submission/models/workspaceitem-sections.model';
import { WorkspaceitemSectionUploadObject } from '../../../core/submission/models/workspaceitem-section-upload.model';
import {
  WorkspaceitemSectionUploadFileObject
} from '../../../core/submission/models/workspaceitem-section-upload-file.model';

const DOI_METADATA = 'dc.identifier.doi';
const API_CHECK_INTERVAL = 3000;
const MAX_TRIES = 5;

function attemptsGuardFactory(maxAttempts: number) {
    return (attemptsCount: number) => {
        if (attemptsCount > maxAttempts) {
          throw new Error('Exceeded pool requests, try again!');
        }
    };
}

export function pollWhile<T>(
    pollInterval: number,
    isPollingActive: (res: T) => boolean,
    maxAttempts = Infinity,
    emitOnlyLast = true,
): MonoTypeOperatorFunction<T> {
    return source$ => {
        const poll$ = timer(0, pollInterval).pipe(
            scan(attempts => ++attempts, 0),
            tap(attemptsGuardFactory(maxAttempts)),
            switchMap(() => source$),
            takeWhile(isPollingActive, true)
        );

        return emitOnlyLast ? poll$.pipe(last()) : poll$;
    };
}


interface UploadSection {
  [key: string]: WorkspaceitemSectionUploadObject;
}

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
    public readonly unpaywallSection$ = new BehaviorSubject<WorkspaceitemSectionUnpaywallObject>(null);
  public readonly uploadSection$ = new BehaviorSubject<UploadSection>(null);

    protected readonly AlertType = AlertType;
    protected readonly section$ = new BehaviorSubject<WorkspaceitemSectionsObject>(null);

  private readonly unsubscribe$ = new Subject<void>();
    private readonly fetch$ = new Subject<boolean>();
    private readonly stopFetch$ = new Subject<void>();

  constructor(
    protected sectionService: SectionsService,
    private store: Store<SubmissionState>,
    private halService: HALEndpointService,
    private submissionService: SubmissionService,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
    private restApi: DspaceRestService,
    private readonly sectionUploadService: SectionUploadService,
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

  public refreshApiCheck(): void {
    this.loading$.next(true);
    this.fetch$.next(true);
  }

  public confirmImport(): void {
    if (this.unpaywallSection$.getValue()?.status === UnpaywallSectionStatus.SUCCESSFUL) {
      this.handleFileUpload();
    }
  }

  protected onSectionInit(): void {
    this.initUnpaywallFetching();
    this.initDoiChangesListener();
    this.initStatusNotification();
    this.initUploadSectionResponseListener();
  }

    protected initDoiChangesListener() {
      this.store.select(submissionObjectFromIdSelector(this.submissionId))
        .pipe(
          filter(submissionEntry => hasValue(submissionEntry?.definition) && hasValue(submissionEntry?.sections)),
          map(value => this.getDoiMetadataValue(value)),
          distinctUntilChanged(),
          takeUntil(this.unsubscribe$),
        )
        .subscribe(doiValue => !!doiValue ? this.showCurrentSection() : this.hideCurrentSection());
    }

    protected initUnpaywallFetching() {
        this.fetch$.pipe(
            switchMap((refreshRequired) =>
                this.patchForRefresh(refreshRequired).pipe(
                    pollWhile(
                        API_CHECK_INTERVAL,
                        res => this.isStillPending(res),
                        MAX_TRIES
                    ),
                    this.getUnpaywallSection(),
                    takeUntil(this.stopFetch$),
                    catchError(err => {
                        this.notificationsService.error(err?.message);
                        return of(Object.assign({}, { ...this.unpaywallSection$.getValue(), status: UnpaywallSectionStatus.NO_FILE }));
                    }),
                )
            ),
            takeUntil(this.unsubscribe$),
        ).subscribe(unpaywall => {
            this.updateUnpaywall(unpaywall);

            const isLoading = !unpaywall?.status || unpaywall?.status === UnpaywallSectionStatus.PENDING;
            this.loading$.next(isLoading);
            if (!isLoading) {
                this.stopFetch$.next();
            }
        });
    }

    protected initStatusNotification() {
        this.status$.pipe(
            filter(hasValue),
            takeUntil(this.unsubscribe$),
        ).subscribe(status => this.handleStatusNotification(status));
    }

    protected handleStatusNotification(status: UnpaywallSectionStatus) {
        switch (status) {
            case UnpaywallSectionStatus.NOT_FOUND:
                this.notificationsService.error(this.translate.instant('submission.sections.unpaywall.status.not-found'));
                break;
            case UnpaywallSectionStatus.NO_FILE:
                this.notificationsService.warning(this.translate.instant('submission.sections.unpaywall.status.no-file'));
                break;
            case UnpaywallSectionStatus.SUCCESSFUL:
                this.notificationsService.success(this.translate.instant('submission.sections.unpaywall.status.successful'));
                break;
            case UnpaywallSectionStatus.IMPORTED:
                this.notificationsService.success(this.translate.instant('submission.sections.unpaywall.status.imported'));
                break;
            default:
                break;
        }
    }

  protected onSectionDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.stopFetch$.next();
    this.stopFetch$.complete();
  }

  protected getSectionStatus(): Observable<boolean> {
    return of(true);
  }

  private initUploadSectionResponseListener() {
    this.section$.pipe(
      filter(hasValue),
      withLatestFrom(this.uploadSection$),
      switchMap(([sections, uploadSection]) => {
        if (hasNoValue(uploadSection) || Object.keys(uploadSection).length === 0) {
          return this.findUploadSection(sections);
        }
        return of(Object.assign({}, ...Object.keys(uploadSection).map(key => ({ [key]: sections[key] }))));
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe(uploadSection => this.uploadSection$.next(uploadSection));
  }

  private findUploadSection<A>(sections: A) {
    return race(
      Object.keys(sections)
        .map(sectionId =>
          this.sectionService.isSectionType(this.submissionId, sectionId, SectionsType.Upload)
            .pipe(
              filter(Boolean),
              map(() => ({ [sectionId]: sections[sectionId] }) as UploadSection),
            )
        )
    );
  }

  private updateUnpaywall(unpaywall: WorkspaceitemSectionUnpaywallObject) {
    this.unpaywallSection$.next(unpaywall);
    this.status$.next(unpaywall?.status);
    }

  private isStillPending(response: WorkspaceitemSectionsObject) {
    return hasNoValue(response?.unpaywall) || (response?.unpaywall as WorkspaceitemSectionUnpaywallObject)?.status === UnpaywallSectionStatus.PENDING;
  }

    private handleFileUpload() {
        this.patchForAccept()
          .pipe(
            filter(hasValue),
            take(1),
          ).subscribe(
          () => {
            this.loading$.next(true);
            this.fetch$.next(false);
            this.listenToUploadSectionChanges();
          },
            () => this.stopFetch$.next()
        );
    }

    private listenToUploadSectionChanges() {
        this.uploadSection$.pipe(
            pairwise(),
            filter(([prev, curr]) => this.isAnyFieldChangedInLength(curr, prev)),
            map(([prev, curr]) => this.mapNewFilesByKey(curr, prev)),
            take(1),
            takeUntil(this.stopFetch$),
        )
            .subscribe(uploadedFiles => Object.keys(uploadedFiles).forEach(key => this.uploadFiles(uploadedFiles, key)));
    }

  private stopApiCheck(): void {
    this.loading$.next(false);
    this.stopFetch$.next();
  }

    private patchForRefresh(refreshRequired = false): Observable<WorkspaceitemSectionsObject> {
        const { operation, linkPath } = this.createOperation('refresh', refreshRequired);
        return this.sendPatchRequest(linkPath, operation);
    }

    private patchForAccept(accepted: boolean = true): Observable<WorkspaceitemSectionsObject> {
        const { operation, linkPath } = this.createOperation('accept', accepted);
        return this.sendPatchRequest(linkPath, operation);
    }

    private createOperation(operationPath: string, value: boolean) {
      const pathCombiner = new JsonPatchOperationPathCombiner('sections', this.sectionData.id);
        const path = pathCombiner.getPath(operationPath);
        const operation = { op: 'add', path: path.path, value } as Operation;
      const linkPath = this.submissionService.getSubmissionObjectLinkName();
        return { operation, linkPath };
    }

  private sendPatchRequest(linkPath: string, operation: Operation) {
    return this.halService.getEndpoint(linkPath)
      .pipe(
        map((endpoint: string) => endpoint.concat(`/${this.submissionId}`)),
        mergeMap((endpoint: string) => this.restApi.request(RestRequestMethod.PATCH, endpoint, [operation])),
        map(response => response.payload?.sections as WorkspaceitemSectionsObject),
        tap(response => this.section$.next(response)),
        take(1)
      );
  }

    private getUnpaywallSection() {
        return (source$: Observable<WorkspaceitemSectionsObject>) =>
            source$.pipe(map(sections => sections?.unpaywall as WorkspaceitemSectionUnpaywallObject));
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
    this.refreshApiCheck();
    this.store.dispatch(new UpdateSectionVisibilityAction(this.submissionId, this.injectedSectionData.id, null));
  }

  private mapNewFilesByKey(curr: UploadSection, prev: UploadSection) {
        return Object.assign({},
            ...Object.keys(curr)
              .map(key => ({ [key]: this.getNewFiles(curr, prev, key) }))
        );
    }

    private uploadFiles(uploadedFiles: { [p: string]: any }, key: string) {
        return uploadedFiles[key].forEach(file => this.sectionUploadService.addUploadedFile(this.submissionId, key, file.uuid, file));
    }

  private getNewFiles(curr: UploadSection, prev: UploadSection, key: string) {
        return curr[key]?.files?.filter(file => this.notContainsFile(prev[key], file));
    }

  private notContainsFile(uploadSection: WorkspaceitemSectionUploadObject, file: WorkspaceitemSectionUploadFileObject) {
        return hasNoValue(uploadSection?.files) || !uploadSection?.files.some(f => f.uuid === file.uuid);
    }

  private isAnyFieldChangedInLength(curr: UploadSection, prev: UploadSection) {
    return Object.keys(curr).some(key => this.isLengthDifferent(curr, prev, key));
    }

  private isLengthDifferent(curr: UploadSection, prev: UploadSection, key: string) {
        return curr[key]?.files.length !== prev[key]?.files.length;
  }

}
