import { HttpXsrfTokenExtractor } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { ScrollToService } from '@nicky-lenaers/ngx-scroll-to';

import { AuthService } from '../../core/auth/auth.service';
import { EntityTypeDataService } from '../../core/data/entity-type-data.service';
import { DragService } from '../../core/drag.service';
import { CookieService } from '../../core/services/cookie.service';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { HostWindowService } from '../../shared/host-window.service';
import { CookieServiceMock } from '../../shared/mocks/cookie.service.mock';
import { HttpXsrfTokenExtractorMock } from '../../shared/mocks/http-xsrf-token-extractor.mock';
import { getMockScrollToService } from '../../shared/mocks/scroll-to-service.mock';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { AuthServiceStub } from '../../shared/testing/auth-service.stub';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service.stub';
import { HostWindowServiceStub } from '../../shared/testing/host-window-service.stub';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { createTestComponent } from '../../shared/testing/utils.test';
import { UploaderComponent } from '../../shared/upload/uploader/uploader.component';
import { MyDSpaceNewExternalDropdownComponent } from './my-dspace-new-external-dropdown/my-dspace-new-external-dropdown.component';
import { MyDSpaceNewSubmissionComponent } from './my-dspace-new-submission.component';
import { MyDSpaceNewSubmissionDropdownComponent } from './my-dspace-new-submission-dropdown/my-dspace-new-submission-dropdown.component';
import { getMockEntityTypeService } from './my-dspace-new-submission-dropdown/my-dspace-new-submission-dropdown.component.spec';

describe('MyDSpaceNewSubmissionComponent test', () => {

  const uploader: any = jasmine.createSpyObj('uploader', {
    clearQueue: jasmine.createSpy('clearQueue').and.stub(),
    onBuildItemForm: jasmine.createSpy('onBuildItemForm').and.stub(),
    uploadAll: jasmine.createSpy('uploadAll').and.stub(),
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        NgbModule,
        RouterTestingModule,
        MyDSpaceNewSubmissionComponent,
        TestComponent,
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: HALEndpointService, useValue: new HALEndpointServiceStub('workspaceitems') },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: ScrollToService, useValue: getMockScrollToService() },
        NgbModal,
        ChangeDetectorRef,
        MyDSpaceNewSubmissionComponent,
        DragService,
        { provide: HttpXsrfTokenExtractor, useValue: new HttpXsrfTokenExtractorMock('mock-token') },
        { provide: CookieService, useValue: new CookieServiceMock() },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(800) },
        { provide: EntityTypeDataService, useValue: getMockEntityTypeService() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(MyDSpaceNewSubmissionComponent, { remove: { imports: [MyDSpaceNewExternalDropdownComponent, MyDSpaceNewSubmissionDropdownComponent, UploaderComponent] } }).compileComponents();
  }));

  describe('', () => {
    let testComp: TestComponent;
    let testFixture: ComponentFixture<TestComponent>;

    // synchronous beforeEach
    beforeEach(() => {
      const html = `
        <ds-my-dspace-new-submission (uploadEnd)="reload($event)"></ds-my-dspace-new-submission>`;

      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });

    it('should create MyDSpaceNewSubmissionComponent', inject([MyDSpaceNewSubmissionComponent], (app: MyDSpaceNewSubmissionComponent) => {

      expect(app).toBeDefined();

    }));
  });

  describe('', () => {
    let fixture: ComponentFixture<MyDSpaceNewSubmissionComponent>;
    let comp: MyDSpaceNewSubmissionComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(MyDSpaceNewSubmissionComponent);
      comp = fixture.componentInstance;
      comp.uploadFilesOptions.authToken = 'user-auth-token';
      comp.uploadFilesOptions.url = 'https://fake.upload-api.url';
      comp.uploaderComponent = TestBed.createComponent(UploaderComponent).componentInstance;
      comp.uploaderComponent.uploader = uploader;
    });

    it('should show a collection selector if only one file are uploaded', (done) => {
      spyOn((comp as any).modalService, 'open').and.returnValue({ result: new Promise((res, rej) => {/****/}) });
      comp.afterFileLoaded(['']);
      expect((comp as any).modalService.open).toHaveBeenCalled();
      done();
    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
  imports: [NgbModule,
    RouterTestingModule],
})
class TestComponent {

  reload = (event) => {
    return;
  };
}
