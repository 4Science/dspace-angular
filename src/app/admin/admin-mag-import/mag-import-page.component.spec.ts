import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagImportPageComponent } from './mag-import-page.component';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { ScriptDataService } from '../../core/data/processes/script-data.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { FormsModule } from '@angular/forms';

describe('AdminMagImportComponent', () => {
  let component: MagImportPageComponent;
  let fixture: ComponentFixture<MagImportPageComponent>;

  let notificationService: NotificationsServiceStub;
  let scriptService: any;
  let router;
  let locationStub;

  beforeEach(async () => {
    notificationService = new NotificationsServiceStub();
    scriptService = jasmine.createSpyObj('scriptService',
      {
        invoke: createSuccessfulRemoteDataObject$({ processId: '46' })
      }
    );
    router = jasmine.createSpyObj('router', {
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    });
    locationStub = jasmine.createSpyObj('location', {
      back: jasmine.createSpy('back')
    });

    await TestBed.configureTestingModule({
      declarations: [ MagImportPageComponent ],
      imports: [
        FormsModule,
        TranslateModule.forRoot(),
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
    fixture = TestBed.createComponent(MagImportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
