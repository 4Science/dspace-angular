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
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from 'src/app/shared/theme-support/theme.service';

import { RequestService } from '@dspace/core';
import { getMockRequestService } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { Item } from '@dspace/core';
import { SearchService } from '@dspace/core';
import { WorkflowItem } from '@dspace/core';
import { ClaimedTaskDataService } from '@dspace/core';
import { ClaimedTask } from '@dspace/core';
import { PoolTaskDataService } from '@dspace/core';
import { ActivatedRouteStub } from '@dspace/core';
import { NotificationsServiceStub } from '@dspace/core';
import { RouterStub } from '@dspace/core';
import { DynamicComponentLoaderDirective } from '../../../abstract-component-loader/dynamic-component-loader.directive';
import { getMockSearchService } from '../../../mocks/search-service.mock';
import { getMockThemeService } from '../../../mocks/theme-service.mock';
import { ClaimedTaskActionsEditMetadataComponent } from '../edit-metadata/claimed-task-actions-edit-metadata.component';
import { ClaimedTaskActionsLoaderComponent } from './claimed-task-actions-loader.component';

const searchService = getMockSearchService();

const requestService = getMockRequestService();

describe('ClaimedTaskActionsLoaderComponent', () => {
  let comp: ClaimedTaskActionsLoaderComponent;
  let fixture: ComponentFixture<ClaimedTaskActionsLoaderComponent>;
  let themeService: ThemeService;

  const option = 'test_option';
  const object = Object.assign(new ClaimedTask(), { id: 'claimed-task-1' });

  const item = Object.assign(new Item(), {
    metadata: {
      'dc.title': [
        {
          language: 'en_US',
          value: 'This is just another title',
        },
      ],
      'dc.type': [
        {
          language: null,
          value: 'Article',
        },
      ],
      'dc.contributor.author': [
        {
          language: 'en_US',
          value: 'Smith, Donald',
        },
      ],
      'dc.date.issued': [
        {
          language: null,
          value: '2015-06-26',
        },
      ],
    },
  });

  const workflowitem = Object.assign(new WorkflowItem(), { id: '333' });

  beforeEach(waitForAsync(() => {
    themeService = getMockThemeService('dspace');

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        ClaimedTaskActionsLoaderComponent,
        ClaimedTaskActionsEditMetadataComponent,
        DynamicComponentLoaderDirective,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ClaimedTaskDataService, useValue: {} },
        { provide: Injector, useValue: {} },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: Router, useValue: new RouterStub() },
        { provide: SearchService, useValue: searchService },
        { provide: RequestService, useValue: requestService },
        { provide: PoolTaskDataService, useValue: {} },
        { provide: ThemeService, useValue: themeService },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
    }).overrideComponent(ClaimedTaskActionsLoaderComponent, {
      set: {
        changeDetection: ChangeDetectionStrategy.Default,
      },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ClaimedTaskActionsLoaderComponent);
    comp = fixture.componentInstance;
    comp.item = item;
    comp.object = object;
    comp.option = option;
    comp.workflowitem = workflowitem;
    spyOn(comp, 'getComponent').and.returnValue(ClaimedTaskActionsEditMetadataComponent);

    fixture.detectChanges();
  }));

  describe('When the component is rendered', () => {
    it('should call the getComponent function', () => {
      expect(comp.getComponent).toHaveBeenCalled();
    });
  });
});
