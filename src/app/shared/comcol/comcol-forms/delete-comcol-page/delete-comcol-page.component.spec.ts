import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { getTestScheduler } from 'jasmine-marbles';
import { of as observableOf } from 'rxjs';

import { ComColDataService } from '../../../../core/data/comcol-data.service';
import { CommunityDataService } from '../../../../core/data/community-data.service';
import {
  DSPACE_OBJECT_DELETION_SCRIPT_NAME,
  ScriptDataService,
} from '../../../../core/data/processes/script-data.service';
import { Community } from '../../../../core/shared/community.model';
import { ProcessParameter } from '../../../../process-page/processes/process-parameter.model';
import { getMockTranslateService } from '../../../mocks/translate.service.mock';
import { NotificationsService } from '../../../notifications/notifications.service';
import {
  createFailedRemoteDataObject$,
  createSuccessfulRemoteDataObject$,
} from '../../../remote-data.utils';
import { NotificationsServiceStub } from '../../../testing/notifications-service.stub';
import { DeleteComColPageComponent } from './delete-comcol-page.component';

describe('DeleteComColPageComponent', () => {
  let router: Router;
  let comp: DeleteComColPageComponent<any>;
  let dsoDataService: CommunityDataService;
  let notificationService: NotificationsServiceStub;
  let fixture: ComponentFixture<DeleteComColPageComponent<any>>;

  let community;
  let newCommunity;
  let parentCommunity;
  let routerStub;
  let routeStub;
  let translateServiceStub;
  let scriptService;
  let scheduler;

  const validUUID = 'valid-uuid';
  const invalidUUID = 'invalid-uuid';
  const frontendURL = '/testType';

  function initializeVars() {
    community = Object.assign(new Community(), {
      uuid: 'a20da287-e174-466a-9926-f66b9300d347',
      metadata: [{
        key: 'dc.title',
        value: 'test community',
      }],
    });

    newCommunity = Object.assign(new Community(), {
      uuid: '1ff59938-a69a-4e62-b9a4-718569c55d48',
      metadata: [{
        key: 'dc.title',
        value: 'new community',
      }],
    });

    parentCommunity = Object.assign(new Community(), {
      uuid: 'a20da287-e174-466a-9926-f66as300d399',
      id: 'a20da287-e174-466a-9926-f66as300d399',
      metadata: [{
        key: 'dc.title',
        value: 'parent community',
      }],
    });

    routerStub = {
      navigate: (commands) => commands,
    };

    routeStub = {
      data: observableOf(community),
    };

    scriptService = jasmine.createSpyObj('scriptService', {
      invoke: createSuccessfulRemoteDataObject$({ processId: '123' }),
    });
  }

  beforeEach(waitForAsync(() => {
    initializeVars();
    notificationService = new NotificationsServiceStub();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), CommonModule, RouterTestingModule],
      providers: [
        { provide: ComColDataService, useValue: dsoDataService },
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: ScriptDataService, useValue: scriptService },
        { provide: NotificationsService, useValue: notificationService },
        { provide: TranslateService, useValue: getMockTranslateService() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteComColPageComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
    (comp as any).frontendURL = frontendURL;
    router = (comp as any).router;
    scheduler = getTestScheduler();
  });

  describe('onConfirm', () => {
    let data1;
    let data2;
    beforeEach(() => {
      data1 = {
        dso: Object.assign(new Community(), {
          uuid: validUUID,
          id: validUUID,
          type: 'community',
          metadata: [{
            key: 'dc.title',
            value: 'test',
          }],
        }),
        _links: {},
      };

      data2 = {
        dso: Object.assign(new Community(), {
          uuid: invalidUUID,
          type: 'community',
          metadata: [{
            key: 'dc.title',
            value: 'test',
          }],
        }),
        _links: {},
        uploader: {
          options: {
            url: '',
          },
          queue: [],
          /* eslint-disable no-empty,@typescript-eslint/no-empty-function */
          uploadAll: () => {
          },
          /* eslint-enable no-empty, @typescript-eslint/no-empty-function */
        },
      };
    });

    it('should show an error notification on failure', () => {
      (scriptService.invoke as any).and.returnValue(createFailedRemoteDataObject$('Error', 500));
      scheduler.schedule(() => comp.onConfirm(data2));
      scheduler.flush();
      fixture.detectChanges();
      expect(notificationService.error).toHaveBeenCalled();
    });

    it('should show a process notification, a success notification and navigate to home on success', waitForAsync(() => {
      const parameterValues: ProcessParameter[] = [
        Object.assign(new ProcessParameter(), { name: '-i', value: data1.dso.uuid }),
      ];
      (scriptService.invoke as jasmine.Spy).and.returnValue(createSuccessfulRemoteDataObject$({ processId: '123' }));
      spyOn(router, 'navigate');
      comp.onConfirm(data1.dso);
      expect(scriptService.invoke).toHaveBeenCalledWith(DSPACE_OBJECT_DELETION_SCRIPT_NAME, parameterValues, []);
      expect(notificationService.process).toHaveBeenCalledWith('123', 5000, jasmine.anything());
      expect(notificationService.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should call script service invoke', () => {
      const parameterValues: ProcessParameter[] = [
        Object.assign(new ProcessParameter(), { name: '-i', value: data1.uuid }),
      ];
      comp.onConfirm(data1);
      fixture.detectChanges();
      expect(scriptService.invoke).toHaveBeenCalledWith(DSPACE_OBJECT_DELETION_SCRIPT_NAME, parameterValues, []);
    });
  });

  describe('onCancel', () => {
    let data1;
    beforeEach(() => {
      data1 = Object.assign(new Community(), {
        uuid: validUUID,
        metadata: [{
          key: 'dc.title',
          value: 'test',
        }],
      });
    });

    it('should redirect to the edit page', () => {
      const redirectURL = frontendURL + '/' + validUUID + '/edit';
      spyOn(router, 'navigate');
      comp.onCancel(data1);
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith([redirectURL]);
    });
  });
});
