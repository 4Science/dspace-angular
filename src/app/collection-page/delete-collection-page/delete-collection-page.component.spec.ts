import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import {
  DSPACE_OBJECT_DELETION_SCRIPT_NAME,
  ScriptDataService,
} from '../../core/data/processes/script-data.service';
import { Collection } from '../../core/shared/collection.model';
import { ProcessParameter } from '../../process-page/processes/process-parameter.model';
import { DSONameServiceMock } from '../../shared/mocks/dso-name.service.mock';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject$,
} from '../../shared/remote-data.utils';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { DeleteCollectionPageComponent } from './delete-collection-page.component';

describe('DeleteCollectionPageComponent', () => {

  let scriptService;
  let comp: DeleteCollectionPageComponent;
  let notificationService: NotificationsServiceStub;
  let fixture: ComponentFixture<DeleteCollectionPageComponent>;

  const mockCollection: Collection = Object.assign(new Collection(), {
    uuid: 'test-uuid',
    id: 'test-uuid',
    name: 'Test Collection',
    type: 'collection',
  });

  beforeEach(waitForAsync(() => {
    notificationService = new NotificationsServiceStub();
    scriptService = jasmine.createSpyObj('scriptService', {
      invoke: createSuccessfulRemoteDataObject$({ processId: '123' }),
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), CommonModule, RouterTestingModule, DeleteCollectionPageComponent],
      providers: [
        { provide: DSONameService, useValue: new DSONameServiceMock() },
        { provide: CollectionDataService, useValue: {} },
        { provide: ActivatedRoute, useValue: { data: observableOf({ dso: { payload: {} } }) } },
        { provide: NotificationsService, useValue: notificationService },
        { provide: ScriptDataService, useValue: scriptService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteCollectionPageComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should have the right frontendURL set', () => {
    expect((comp as any).frontendURL).toEqual('/collections/');
  });

  describe('onConfirm', () => {
    it('should invoke the deletion script with correct params, show success notification and redirect on success', (done) => {
      const parameterValues: ProcessParameter[] = [
        Object.assign(new ProcessParameter(), { name: '-i', value: mockCollection.uuid }),
      ];
      (scriptService.invoke as jasmine.Spy).and.returnValue(createSuccessfulRemoteDataObject$({ processId: '123' }));
      comp.onConfirm(mockCollection);
      setTimeout(() => {
        expect(scriptService.invoke).toHaveBeenCalledWith(DSPACE_OBJECT_DELETION_SCRIPT_NAME, parameterValues, []);
        expect(notificationService.success).toHaveBeenCalledWith('collection.delete.notification.success');
        expect(notificationService.process).toHaveBeenCalledWith('123', 5000, jasmine.any(Object));
        done();
      }, 0);
    });

    it('error notification is shown', (done) => {
      (scriptService.invoke as jasmine.Spy).and.returnValue(createFailedRemoteDataObject$('Error', 500));
      comp.onConfirm(mockCollection);
      setTimeout(() => {
        expect(notificationService.error).toHaveBeenCalledWith('collection.delete.notification.fail');
        done();
      }, 0);
    });
  });

});
