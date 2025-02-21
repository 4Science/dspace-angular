import {
  ChangeDetectionStrategy,
  Injector,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { RequestService } from '@dspace/core';
import { getMockRequestService } from '@dspace/core';
import { TranslateLoaderMock } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { SearchService } from '@dspace/core';
import { ClaimedTaskDataService } from '@dspace/core';
import { ClaimedTask } from '@dspace/core';
import { PoolTaskDataService } from '@dspace/core';
import { ClaimedTaskDataServiceStub } from '@dspace/core';
import { NotificationsServiceStub } from '@dspace/core';
import { RouterStub } from '@dspace/core';
import { getMockSearchService } from '../../../mocks/search-service.mock';
import { ClaimedTaskActionsDeclineTaskComponent } from './claimed-task-actions-decline-task.component';

let component: ClaimedTaskActionsDeclineTaskComponent;
let fixture: ComponentFixture<ClaimedTaskActionsDeclineTaskComponent>;

const searchService = getMockSearchService();

const requestService = getMockRequestService();

let mockPoolTaskDataService: PoolTaskDataService;

describe('ClaimedTaskActionsDeclineTaskComponent', () => {
  const object = Object.assign(new ClaimedTask(), { id: 'claimed-task-1' });

  let claimedTaskService: ClaimedTaskDataServiceStub;

  beforeEach(waitForAsync(() => {
    claimedTaskService = new ClaimedTaskDataServiceStub();

    mockPoolTaskDataService = new PoolTaskDataService(null, null, null, null);
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        ClaimedTaskActionsDeclineTaskComponent,
      ],
      providers: [
        { provide: ClaimedTaskDataService, useValue: claimedTaskService },
        { provide: Injector, useValue: {} },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: Router, useValue: new RouterStub() },
        { provide: SearchService, useValue: searchService },
        { provide: RequestService, useValue: requestService },
        { provide: PoolTaskDataService, useValue: mockPoolTaskDataService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ClaimedTaskActionsDeclineTaskComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimedTaskActionsDeclineTaskComponent);
    component = fixture.componentInstance;
    component.object = object;
    spyOn(component, 'initReloadAnchor').and.returnValue(undefined);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
  });

  it('should display decline button', () => {
    const btn = fixture.debugElement.query(By.css('.declineTaskAction'));

    expect(btn).not.toBeNull();
  });

  it('should display spin icon when decline is pending', () => {
    component.processing$.next(true);
    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('.declineTaskAction .fa-spin'));

    expect(span).not.toBeNull();
  });

});
