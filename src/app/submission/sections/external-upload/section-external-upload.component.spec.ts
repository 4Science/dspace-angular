import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { NgxPaginationModule } from 'ngx-pagination';
import { of, of as observableOf } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { createSuccessfulRemoteDataObject$ } from '../../../shared/remote-data.utils';
import { createTestComponent } from '../../../shared/testing/utils.test';
import { SubmissionService } from '../../submission.service';
import { SubmissionServiceStub } from '../../../shared/testing/submission-service.stub';
import { SectionsService } from '../sections.service';
import { SectionDataObject } from '../models/section-data.model';
import { SectionsType } from '../sections-type';
import { mockSubmissionCollectionId, mockSubmissionId } from '../../../shared/mocks/submission.mock';
import { JsonPatchOperationPathCombiner } from '../../../core/json-patch/builder/json-patch-operation-path-combiner';
import { CollectionDataService } from '../../../core/data/collection-data.service';
import { JsonPatchOperationsBuilder } from '../../../core/json-patch/builder/json-patch-operations-builder';
import { License } from '../../../core/shared/license.model';
import { Collection } from '../../../core/shared/collection.model';


import { SectionExternalUploadComponent } from './section-external-upload.component';
import { ExternalUploadService } from './external-upload.service';
import { ExternalServiceStub } from './external-upload-service.mock';

function getMockCollectionDataService(): CollectionDataService {
  return jasmine.createSpyObj('CollectionDataService', {
    findById: jasmine.createSpy('findById'),
    findByHref: jasmine.createSpy('findByHref')
  });
}

const sectionObject: SectionDataObject = {
  config: 'https://dspace.org/api/config/submissionforms/detect-duplicate',
  mandatory: true,
  opened: true,
  data: {},
  errorsToShow: [],
  serverValidationErrors: [],
  header: 'submit.progressbar.detect-duplicate',
  id: 'external-upload',
  sectionType: SectionsType.DetectDuplicate,
  sectionVisibility: null
};

describe('SectionExternalUploadComponent test suite', () => {
  let comp: SectionExternalUploadComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<SectionExternalUploadComponent>;
  let sectionsServiceStub: any;
  let collectionDataService: any;
  let externalUploadService: any = jasmine.createSpyObj('externalUploadService', {
    executeExternalUpload: jasmine.createSpy('executeExternalUpload'),
  });

  const sectionsService: any = jasmine.createSpyObj('sectionsService', {
    isSectionTypeAvailable: of(true),
    isSectionActive: of(true),
    setSectionStatus: () => null
  });

  const submissionId = mockSubmissionId;
  const collectionId = mockSubmissionCollectionId;
  const jsonPatchOpBuilder: any = jasmine.createSpyObj('jsonPatchOpBuilder', {
    add: jasmine.createSpy('add'),
    replace: jasmine.createSpy('replace'),
    remove: jasmine.createSpy('remove'),
  });

  const licenseText = 'License text';
  const mockCollection = Object.assign(new Collection(), {
    name: 'Community 1-Collection 1',
    id: collectionId,
    metadata: [
      {
        key: 'dc.title',
        language: 'en_US',
        value: 'Community 1-Collection 1'
      }],
    license: createSuccessfulRemoteDataObject$(Object.assign(new License(), { text: licenseText }))
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
      declarations: [
        SectionExternalUploadComponent,
        TestComponent,
      ],
      providers: [
        { provide: CollectionDataService, useValue: getMockCollectionDataService() },
        { provide: SectionsService, useValue: sectionsService },
        { provide: JsonPatchOperationsBuilder, useValue: jsonPatchOpBuilder },
        { provide: ExternalUploadService, useValue: ExternalServiceStub },
        { provide: SubmissionService, useClass: SubmissionServiceStub },
        { provide: 'collectionIdProvider', useValue: collectionId },
        { provide: 'sectionDataProvider', useValue: sectionObject },
        { provide: 'submissionIdProvider', useValue: submissionId },
        SectionExternalUploadComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents().then();
  }));

  // First test to check the correct component creation
  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
        <ds-section-external-upload></ds-section-external-upload>`;
      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create SectionExternalUploadComponent', inject([SectionExternalUploadComponent], (app: SectionExternalUploadComponent) => {
      expect(app).toBeDefined();
    }));
  });

  describe('', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(SectionExternalUploadComponent);
      comp = fixture.componentInstance;
      compAsAny = comp;
      sectionsServiceStub = TestBed.inject(SectionsService);
      collectionDataService = TestBed.inject(CollectionDataService);
      externalUploadService = TestBed.inject(ExternalUploadService);
      compAsAny.pathCombiner = new JsonPatchOperationPathCombiner('sections', sectionObject.id);
      compAsAny.errors$ = observableOf([]);
    });

    afterEach(() => {
      fixture.destroy();
      comp = null;
      compAsAny = null;
    });

    it('Should init section properly', () => {
      spyOn(compAsAny, 'getSectionStatus').and.returnValue(observableOf(true));

      comp.onSectionInit();
      fixture.detectChanges();

      expect(comp.source).toBeFalsy();
    });

    it('Button should be disabled if no source', () => {
      comp.loading$ = of(false);

      comp.onSectionInit();
      fixture.detectChanges();

      expect(comp.source).toBeFalsy();
      expect(fixture.debugElement.query(By.css('button')).nativeElement.disabled).toBeTruthy();
    });

    it('Should execute upload if source is present', () => {
      spyOn(compAsAny, 'submitUpload');
      comp.loading$ = of(false);

      comp.onSectionInit();
      comp.source = '/path/to/file';
      comp.submissionId = 'subId';

      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button')).nativeElement;
      button.click();

      expect(fixture.debugElement.query(By.css('button')).nativeElement.disabled).toBeFalsy();
      expect(compAsAny.submitUpload).toHaveBeenCalled();
    });

  });

});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``
})
class TestComponent {

}
