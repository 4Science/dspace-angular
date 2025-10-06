import { Location } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';

import { ScriptDataService } from '../../core/data/processes/script-data.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { SwitchComponent } from '../../shared/switch/switch.component';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { FileDropzoneNoUploaderComponent } from '../../shared/upload/file-dropzone-no-uploader/file-dropzone-no-uploader.component';
import { MarcImportPageComponent } from './marc-import-page.component';

describe('AdminMarcImportComponent', () => {
  let component: MarcImportPageComponent;
  let fixture: ComponentFixture<MarcImportPageComponent>;

  let notificationService: NotificationsServiceStub;
  let scriptService: any;
  let router;
  let locationStub;

  beforeEach(async () => {
    notificationService = new NotificationsServiceStub();
    scriptService = jasmine.createSpyObj('scriptService',
      {
        invoke: createSuccessfulRemoteDataObject$({ processId: '47' }),
      },
    );
    router = jasmine.createSpyObj('router', {
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    });
    locationStub = jasmine.createSpyObj('location', {
      back: jasmine.createSpy('back'),
    });

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TranslateModule.forRoot(),
        MarcImportPageComponent,
        MockComponent(SwitchComponent),
        MockComponent(FileDropzoneNoUploaderComponent),
      ],
      providers: [
        { provide: NotificationsService, useValue: notificationService },
        { provide: ScriptDataService, useValue: scriptService },
        { provide: Router, useValue: router },
        { provide: Location, useValue: locationStub },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcImportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
