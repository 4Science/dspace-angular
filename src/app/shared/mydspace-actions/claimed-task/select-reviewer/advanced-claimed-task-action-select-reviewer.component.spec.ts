import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { RequestService } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { SearchService } from '@dspace/core';
import { WorkflowItem } from '@dspace/core';
import { ClaimedTaskDataService } from '@dspace/core';
import { ClaimedTask } from '@dspace/core';
import { ActivatedRouteStub } from '@dspace/core';
import { ClaimedTaskDataServiceStub } from '@dspace/core';
import { NotificationsServiceStub } from '@dspace/core';
import { RouterStub } from '@dspace/core';
import { SearchServiceStub } from '@dspace/core';
import { ADVANCED_WORKFLOW_ACTION_SELECT_REVIEWER } from '../../../../workflowitems-edit-page/advanced-workflow-action/advanced-workflow-action-select-reviewer/advanced-workflow-action-select-reviewer.component';
import { AdvancedClaimedTaskActionSelectReviewerComponent } from './advanced-claimed-task-action-select-reviewer.component';


const taskId = 'claimed-task-1';
const workflowId = 'workflow-1';

describe('AdvancedClaimedTaskActionSelectReviewerComponent', () => {
  const object = Object.assign(new ClaimedTask(), {
    id: taskId,
    workflowitem: observableOf(Object.assign(new WorkflowItem(), {
      id: workflowId,
    })),
  });
  let component: AdvancedClaimedTaskActionSelectReviewerComponent;
  let fixture: ComponentFixture<AdvancedClaimedTaskActionSelectReviewerComponent>;

  let route: ActivatedRouteStub;
  let claimedTaskDataService: ClaimedTaskDataServiceStub;
  let notificationService: NotificationsServiceStub;
  let router: RouterStub;
  let searchService: SearchServiceStub;

  beforeEach(async () => {
    route = new ActivatedRouteStub();
    claimedTaskDataService = new ClaimedTaskDataServiceStub();
    notificationService = new NotificationsServiceStub();
    router = new RouterStub();
    searchService = new SearchServiceStub();

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        AdvancedClaimedTaskActionSelectReviewerComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: ClaimedTaskDataService, useValue: claimedTaskDataService },
        { provide: NotificationsService, useValue: notificationService },
        { provide: RequestService, useValue: {} },
        { provide: Router, useValue: router },
        { provide: SearchService, useValue: searchService },
        Location,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedClaimedTaskActionSelectReviewerComponent);
    component = fixture.componentInstance;
    component.object = object;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.debugElement.nativeElement.remove();
  });

  it('should display select reviewer button', () => {
    const btn = fixture.debugElement.query(By.css('.selectReviewerAction'));

    expect(btn).not.toBeNull();
  });

  it('should navigate to the advanced workflow page when clicked', () => {
    component.workflowTaskPageRoute = `/workflowitems/${workflowId}/advanced`;
    fixture.debugElement.query(By.css('.selectReviewerAction')).nativeElement.click();

    expect(router.navigate).toHaveBeenCalledWith([`/workflowitems/${workflowId}/advanced`], {
      queryParams: {
        workflow: ADVANCED_WORKFLOW_ACTION_SELECT_REVIEWER,
        claimedTask: taskId,
      },
    });
  });
});
