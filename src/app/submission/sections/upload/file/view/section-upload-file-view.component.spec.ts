import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Metadata } from '../../../../../core/shared/metadata.utils';
import { FormComponent } from '../../../../../shared/form/form.component';
import { mockUploadFiles } from '../../../../../shared/mocks/submission.mock';
import { createTestComponent } from '../../../../../shared/testing/utils.test';
import { TruncatePipe } from '../../../../../shared/utils/truncate.pipe';
import { SubmissionSectionUploadAccessConditionsComponent } from '../../accessConditions/submission-section-upload-access-conditions.component';
import { SubmissionSectionUploadFileViewComponent } from './section-upload-file-view.component';

describe('SubmissionSectionUploadFileViewComponent test suite', () => {

  let comp: SubmissionSectionUploadFileViewComponent;
  let compAsAny: any;
  let fixture: ComponentFixture<SubmissionSectionUploadFileViewComponent>;

  const fileData: any = mockUploadFiles[0];

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgbTooltipModule,
        TranslateModule.forRoot(),
        TruncatePipe,
        FormComponent,
        SubmissionSectionUploadFileViewComponent,
        TestComponent,
      ],
      providers: [
        SubmissionSectionUploadFileViewComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SubmissionSectionUploadFileViewComponent, {
        remove: {
          imports: [SubmissionSectionUploadAccessConditionsComponent],
        },
        add: {
          changeDetection: ChangeDetectionStrategy.Default,
        },
      })
      .compileComponents().then();
  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
      <ds-submission-section-upload-file-view [fileData]="fileData"></ds-submission-section-upload-file-view>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create SubmissionSectionUploadFileViewComponent', inject([SubmissionSectionUploadFileViewComponent], (app: SubmissionSectionUploadFileViewComponent) => {

      expect(app).toBeDefined();

    }));
  });

  describe('', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(SubmissionSectionUploadFileViewComponent);
      comp = fixture.componentInstance;
      compAsAny = comp;
    });

    afterEach(() => {
      fixture.destroy();
      comp = null;
      compAsAny = null;
    });

    it('should init metadata array properly', () => {
      comp.fileData = fileData;
      const expectMetadataMap = {
        [comp.fileTitleKey]: Metadata.all(fileData.metadata, 'dc.title'),
        [comp.fileDescrKey]: [],
      };

      fixture.detectChanges();

      expect(comp.metadata).toEqual(expectMetadataMap);

    });

  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
})
class TestComponent {

  fileData = mockUploadFiles[0];
}
