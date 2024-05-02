import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionSectionUnpaywallComponent } from './submission-section-unpaywall.component';
import { SectionsService } from '../sections.service';
import { FormService } from '../../../shared/form/form.service';
import { FormBuilderService } from '../../../shared/form/builder/form-builder.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../shared/mocks/translate-loader.mock';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { getMockScrollToService } from '../../../shared/mocks/scroll-to-service.mock';
import { SubmissionService } from '../../submission.service';
import { SubmissionRestService } from '../../../core/submission/submission-rest.service';
import { RemoteDataBuildService } from '../../../core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../../core/cache/object-cache.service';
import { UUIDService } from '../../../core/shared/uuid.service';
import { HALEndpointService } from '../../../core/shared/hal-endpoint.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchService } from '../../../core/shared/search/search.service';
import { CommunityDataService } from '../../../core/data/community-data.service';
import { DSOChangeAnalyzer } from '../../../core/data/dso-change-analyzer.service';
import { BitstreamFormatDataService } from '../../../core/data/bitstream-format-data.service';
import { DSpaceObjectDataService } from '../../../core/data/dspace-object-data.service';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { Angulartics2, RouterlessTracking } from 'angulartics2';
import {
  SubmissionJsonPatchOperationsService
} from '../../../core/submission/submission-json-patch-operations.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RequestService } from '../../../core/data/request.service';
import { getMockRequestService } from '../../../shared/mocks/request.service.mock';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { NativeWindowRef, NativeWindowService } from '../../../core/services/window.service';
import { AuthRequestService } from '../../../core/auth/auth-request.service';
import { AuthRequestServiceStub } from '../../../shared/testing/auth-request-service.stub';
import { EPersonDataService } from '../../../core/eperson/eperson-data.service';
import { CookieService } from '../../../core/services/cookie.service';
import { HardRedirectService } from '../../../core/services/hard-redirect.service';
import { storeModuleConfig } from '../../../app.reducer';
import { HttpXsrfTokenExtractor } from '@angular/common/http';
import { HttpXsrfTokenExtractorMock } from '../../../shared/mocks/http-xsrf-token-extractor.mock';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DspaceRestService } from '../../../core/dspace-rest/dspace-rest.service';
import { mockSubmissionCollectionId, mockSubmissionId } from '../../../shared/mocks/submission.mock';
import {
  WorkspaceitemSectionUnpaywallObject
} from '../../../core/submission/models/workspaceitem-section-unpaywall-object';
import { UnpaywallSectionStatus } from './models/unpaywall-section-status';
import { of } from 'rxjs';
import { AuthTokenInfo } from '../../../core/auth/models/auth-token-info.model';
import { provideMockStore } from '@ngrx/store/testing';
import { SubmissionObject } from '../../../core/submission/models/submission-object.model';
import { SectionsType } from '../sections-type';
import { WorkspaceitemSectionUploadObject } from '../../../core/submission/models/workspaceitem-section-upload.model';
import {
  WorkspaceitemSectionUploadFileObject
} from '../../../core/submission/models/workspaceitem-section-upload-file.model';
import { RawRestResponse } from '../../../core/dspace-rest/raw-rest-response.model';
import { SubmissionState } from '../../submission.reducers';
import { SectionUploadService } from '../upload/section-upload.service';
import { getMockSectionUploadService } from '../../../shared/mocks/section-upload.service.mock';

describe('SubmissionSectionUnpaywallComponentComponent', () => {
  let component: SubmissionSectionUnpaywallComponent;
  let fixture: ComponentFixture<SubmissionSectionUnpaywallComponent>;
  let httpMock: HttpTestingController;
  let submissionService: SubmissionService;
  let halService: HALEndpointService;
  let tokenExtractor: HttpXsrfTokenExtractor;
  let sectionService: SectionsService;
  let notificationsService: NotificationsService;
  let translate: TranslateService;
  let restApi: DspaceRestService;
  let store: Store<SubmissionState>;
    let sectionUploadService: SectionUploadService;
  const xsrfToken = 'mock-token';

  const initialState = {
    core: {
      auth: {
        authenticated: true,
        loaded: true,
        blocking: false,
        loading: false,
        authToken: new AuthTokenInfo('test_token'),
        userId: 'testid',
        authMethods: []
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot({}, storeModuleConfig),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          },
        }),
      ],
      providers: [
        SectionsService,
        FormService,
        FormBuilderService,
        NotificationsService,
        SubmissionService,
        SubmissionRestService,
        RemoteDataBuildService,
        ObjectCacheService,
        UUIDService,
        HALEndpointService,
        SearchService,
        CommunityDataService,
        DSOChangeAnalyzer,
        BitstreamFormatDataService,
        DSpaceObjectDataService,
        SearchConfigurationService,
        RouterlessTracking,
        SubmissionJsonPatchOperationsService,
        AuthService,
        EPersonDataService,
        CookieService,
        HardRedirectService,
        DspaceRestService,
        provideMockStore({ initialState }),
        { provide: HttpXsrfTokenExtractor, useValue: new HttpXsrfTokenExtractorMock(xsrfToken) },
        { provide: AuthRequestService, useValue: new AuthRequestServiceStub() },
        { provide: ScrollToService, useValue: getMockScrollToService() },
        { provide: RequestService, useValue: getMockRequestService() },
        { provide: Angulartics2, useValue: {} },
        { provide: REQUEST, useValue: {} },
        { provide: NativeWindowService, useValue: new NativeWindowRef() },
        { provide: 'collectionIdProvider', useValue: mockSubmissionCollectionId },
        { provide: 'sectionDataProvider', useValue: {} },
        { provide: 'submissionIdProvider', useValue: mockSubmissionId },
          { provide: SectionUploadService, useValue: getMockSectionUploadService() },
      ],
      declarations: [SubmissionSectionUnpaywallComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionSectionUnpaywallComponent);
    submissionService = TestBed.inject(SubmissionService);
    halService = TestBed.inject(HALEndpointService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenExtractor = TestBed.inject(HttpXsrfTokenExtractor);
    sectionService = TestBed.inject(SectionsService);
    notificationsService = TestBed.inject(NotificationsService);
    translate = TestBed.inject(TranslateService);
    restApi = TestBed.inject(DspaceRestService);
    store = TestBed.inject(Store);
      sectionUploadService = TestBed.inject(SectionUploadService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('import file', () => {
    it('should import the linked resource if needed', () => {
      const submissionObjectName = 'workspaceitems';
      const testEndpoint = 'http://test-endpoint';
      const successLabel = of('success-label');
      const uploadSection: WorkspaceitemSectionUploadObject = { files: [] };
      const successfulSection: WorkspaceitemSectionUnpaywallObject = {
        id: 1,
        status: UnpaywallSectionStatus.SUCCESSFUL,
        doi: 'test-doi',
        itemId: 'test-item-id',
        timestampCreated: new Date(),
        timestampLastModified: new Date()
      };
      const importedResource = {
        sections: {
          [SectionsType.Unpaywall]: {
            status: UnpaywallSectionStatus.IMPORTED,
            doi: 'test-doi',
            itemId: 'test-item-id',
            timestampCreated: new Date(),
            timestampLastModified: new Date()
          } as WorkspaceitemSectionUnpaywallObject,
          [SectionsType.Upload]: {
            files: [{
              uuid: 'uploaded-file-bitstream-uuid'
            } as WorkspaceitemSectionUploadFileObject]
          } as WorkspaceitemSectionUploadObject
        }
      } as unknown as SubmissionObject;
      component.unpaywallSection$.next(successfulSection);
      component.uploadSection$.next({ [SectionsType.Upload]: uploadSection });
      const requestResponse = { payload: importedResource } as unknown as RawRestResponse;
      jasmine.clock().install();

      spyOn(submissionService, 'getSubmissionObjectLinkName').and.returnValue(submissionObjectName);
      spyOn(halService, 'getEndpoint').withArgs(submissionObjectName).and.returnValue(of(testEndpoint));
      spyOn(tokenExtractor, 'getToken').and.returnValue(xsrfToken);
      spyOn(restApi, 'request').and.returnValue(of(requestResponse));
      spyOn(sectionService, 'isSectionType')
        .withArgs(mockSubmissionId, SectionsType.Unpaywall, SectionsType.Upload).and.returnValue(of(false))
        .withArgs(mockSubmissionId, SectionsType.Upload, SectionsType.Upload).and.returnValue(of(true));
      spyOn(translate, 'get').withArgs('submission.sections.unpaywall.status.imported').and.returnValue(successLabel);
      spyOn(component.loading$, 'next');
      spyOn(component.status$, 'next');
      spyOn(component.unpaywallSection$, 'next');
      spyOn(notificationsService, 'success').withArgs(null, successLabel);
      spyOn(notificationsService, 'error');

      component.confirmImport();

      expect(component.loading$.next).toHaveBeenCalledWith(false);
      expect(component.status$.next).toHaveBeenCalledOnceWith((importedResource.sections[SectionsType.Unpaywall] as WorkspaceitemSectionUnpaywallObject).status);
      expect(component.unpaywallSection$.next).toHaveBeenCalledWith(importedResource.sections[SectionsType.Unpaywall] as WorkspaceitemSectionUnpaywallObject);
      expect(sectionUploadService.addUploadedFile).toHaveBeenCalledTimes(1);
      jasmine.clock().uninstall();
    });
  });

  describe('refreshApiCheck', () => {
    it('should refresh api call', () => {
      const linkName = 'linkName';
      const testEndpoint = 'http://test-endpoint';
      const submissionObject = {
        sections: {
          [SectionsType.Unpaywall]: {
            status: UnpaywallSectionStatus.SUCCESSFUL,
            doi: 'test-doi',
            itemId: 'test-item-id',
            timestampCreated: new Date(),
            timestampLastModified: new Date()
          } as WorkspaceitemSectionUnpaywallObject
        }
      } as unknown as SubmissionObject;
      const requestResponse = { payload: submissionObject } as unknown as RawRestResponse;
      jasmine.clock().install();

      spyOn(submissionService, 'getSubmissionObjectLinkName').and.returnValue(linkName);
      spyOn(halService, 'getEndpoint').withArgs(linkName).and.returnValue(of(testEndpoint));
      spyOn(restApi, 'request').and.returnValue(of(requestResponse));
      spyOn(component.loading$, 'next');
      spyOn(component.status$, 'next')
        .withArgs((submissionObject.sections[SectionsType.Unpaywall] as WorkspaceitemSectionUnpaywallObject).status);
        spyOn(component.unpaywallSection$, 'next')
        .withArgs(submissionObject.sections[SectionsType.Unpaywall] as WorkspaceitemSectionUnpaywallObject);

      component.refreshApiCheck();
      jasmine.clock().tick(3010);

      expect(component.loading$.next).toHaveBeenCalledWith(false);
      expect(component.status$.next).toHaveBeenCalledOnceWith((submissionObject.sections[SectionsType.Unpaywall] as WorkspaceitemSectionUnpaywallObject).status);
        expect(component.unpaywallSection$.next).toHaveBeenCalledOnceWith(submissionObject.sections[SectionsType.Unpaywall] as WorkspaceitemSectionUnpaywallObject);
      jasmine.clock().uninstall();
    });
  });
});
