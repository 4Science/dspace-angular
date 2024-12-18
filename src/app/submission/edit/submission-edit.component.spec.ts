import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  of as observableOf,
  of,
} from 'rxjs';

import { APP_DATA_SERVICES_MAP } from '../../../config/app-config.interface';
import { AuthService } from '../../core/auth/auth.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { ItemDataService } from '../../core/data/item-data.service';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { MetadataSecurityConfigurationService } from '../../core/submission/metadatasecurityconfig-data.service';
import { SubmissionObject } from '../../core/submission/models/submission-object.model';
import { SubmissionJsonPatchOperationsService } from '../../core/submission/submission-json-patch-operations.service';
import { XSRFService } from '../../core/xsrf/xsrf.service';
import { mockSubmissionObject } from '../../shared/mocks/submission.mock';
import { getMockThemeService } from '../../shared/mocks/theme-service.mock';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { ActivatedRouteStub } from '../../shared/testing/active-router.stub';
import { AuthServiceStub } from '../../shared/testing/auth-service.stub';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { RouterStub } from '../../shared/testing/router.stub';
import { SectionsServiceStub } from '../../shared/testing/sections-service.stub';
import { SubmissionJsonPatchOperationsServiceStub } from '../../shared/testing/submission-json-patch-operations-service.stub';
import { SubmissionServiceStub } from '../../shared/testing/submission-service.stub';
import { ThemeService } from '../../shared/theme-support/theme.service';
import { SubmissionFormComponent } from '../form/submission-form.component';
import { SectionsService } from '../sections/sections.service';
import { SubmissionService } from '../submission.service';
import { SubmissionEditComponent } from './submission-edit.component';
import { SubmissionEditCanDeactivateService } from './submission-edit-can-deactivate.service';

describe('SubmissionEditComponent Component', () => {

  let comp: SubmissionEditComponent;
  let fixture: ComponentFixture<SubmissionEditComponent>;

  let itemDataService: ItemDataService;
  let metadataSecurityConfigDataService: MetadataSecurityConfigurationService;
  let canDeactivateService: SubmissionEditCanDeactivateService;
  let collectionDataService: CollectionDataService;

  let router: Router;
  let halService: jasmine.SpyObj<HALEndpointService>;

  let themeService = getMockThemeService();

  const submissionId = '826';
  const route: ActivatedRouteStub = new ActivatedRouteStub();
  const submissionObject: any = mockSubmissionObject;

  const collectionDataServiceSpy: jasmine.SpyObj<CollectionDataService> = jasmine.createSpyObj('collectionDataService', {
    findById: jasmine.createSpy('findById'),
    getAuthorizedCollectionByCommunity: jasmine.createSpy('getAuthorizedCollectionByCommunity'),
    getAuthorizedCollectionByCommunityAndEntityType: jasmine.createSpy('getAuthorizedCollectionByCommunityAndEntityType'),
  });
  const canDeactivateServiceSpy: jasmine.SpyObj<SubmissionEditCanDeactivateService> = jasmine.createSpyObj('canDeactivateService', {
    canDeactivate: of(true),
  });
  const itemDataServiceSpy = jasmine.createSpyObj('itemDataService', {
    findByHref: createSuccessfulRemoteDataObject$(submissionObject.item),
  });

  halService = jasmine.createSpyObj('halService', {
    getEndpoint: of('fake-url'),
  });

  const metadataSecurityConfigDataServiceSpy = jasmine.createSpyObj('metadataSecurityConfigDataService', {
    findById: createSuccessfulRemoteDataObject$(submissionObject.metadataSecurityConfiguration),
  });

  const submissionServiceStub = new SubmissionServiceStub();
  const submissionJsonPatchOperationsServiceStub = new SubmissionJsonPatchOperationsServiceStub();

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
          { path: ':id/edit', component: SubmissionEditComponent, pathMatch: 'full' },
        ]),
        SubmissionEditComponent,
      ],
      providers: [
        { provide: NotificationsService, useClass: NotificationsServiceStub },
        { provide: SubmissionService, useValue: submissionServiceStub },
        { provide: SubmissionJsonPatchOperationsService, useValue: submissionJsonPatchOperationsServiceStub },
        { provide: ItemDataService, useValue: itemDataServiceSpy },
        { provide: MetadataSecurityConfigurationService, useValue: metadataSecurityConfigDataServiceSpy },
        { provide: CollectionDataService, useValue: collectionDataServiceSpy },
        { provide: Router, useValue: new RouterStub() },
        { provide: ActivatedRoute, useValue: route },
        { provide: AuthService, useValue: new AuthServiceStub() },
        { provide: HALEndpointService, useValue: halService },
        { provide: SectionsService, useValue: new SectionsServiceStub() },
        { provide: ThemeService, useValue: themeService },
        { provide: XSRFService, useValue: {} },
        { provide: APP_DATA_SERVICES_MAP, useValue: {} },
        provideMockStore(),
        { provide: SubmissionEditCanDeactivateService, useValue: canDeactivateServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(SubmissionEditComponent, {
      remove: {
        imports: [ SubmissionFormComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionEditComponent);
    comp = fixture.componentInstance;
    router = TestBed.inject(Router);
    canDeactivateService = TestBed.inject(SubmissionEditCanDeactivateService);
    collectionDataService = TestBed.inject(CollectionDataService);
    itemDataService = TestBed.inject(ItemDataService);
    metadataSecurityConfigDataService = TestBed.inject(MetadataSecurityConfigurationService);
  });

  afterEach(() => {
    comp = null;
    fixture = null;
    router = null;
  });

  it('should init properly when a valid SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(
      createSuccessfulRemoteDataObject$(submissionObject),
    );
    submissionServiceStub.getSubmissionObject.and.returnValue(observableOf(submissionObject));
    submissionServiceStub.getSubmissionStatus.and.returnValue(observableOf(true));


    fixture.detectChanges();

    expect(comp.submissionId).toBe(submissionId);
    expect(comp.collectionId).toBe(submissionObject.collection.id);
    expect(comp.selfUrl).toBe(submissionObject._links.self.href);
    expect(comp.sections).toBe(submissionObject.sections);
    expect(comp.submissionDefinition).toBe(submissionObject.submissionDefinition);

  });

  it('should redirect to mydspace when an empty SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(createSuccessfulRemoteDataObject$<SubmissionObject>({} as SubmissionObject),
    );

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalled();

  });

  it('should not has effects when an invalid SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(observableOf(null));

    fixture.detectChanges();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(comp.collectionId).toBeUndefined();
    expect(comp.selfUrl).toBeUndefined();
    expect(comp.sections).toBeUndefined();
    expect(comp.submissionDefinition).toBeUndefined();
  });

  describe('ngOnDestroy', () => {
    it('should call delete pending json patch operations', fakeAsync(() => {

      submissionJsonPatchOperationsServiceStub.deletePendingJsonPatchOperations.and.callFake(() => { /* */ });
      comp.ngOnDestroy();

      expect(submissionJsonPatchOperationsServiceStub.deletePendingJsonPatchOperations).toHaveBeenCalled();
    }));

  });

});
