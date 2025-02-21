import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../../../../../environments/environment';
import { AuthService } from '@dspace/core';
import { DSONameService } from '@dspace/core';
import { LinkService } from '@dspace/core';
import { APP_CONFIG } from '@dspace/core';
import { AuthorizationDataService } from '@dspace/core';
import { followLink } from '@dspace/core';
import { getMockLinkService } from '@dspace/core';
import { WorkflowItemSearchResult } from '@dspace/core';
import { Item } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { WorkflowItem } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { XSRFService } from '@dspace/core';
import { AuthServiceMock } from '../../../../../shared/mocks/auth.service.mock';
import { DSONameServiceMock } from '../../../../../shared/mocks/dso-name.service.mock';
import { mockTruncatableService } from '../../../../../shared/mocks/mock-trucatable.service';
import { getMockThemeService } from '../../../../../shared/mocks/theme-service.mock';
import { CollectionElementLinkType } from '../../../../../shared/object-collection/collection-element-link.type';
import { ThemeService } from '../../../../../shared/theme-support/theme.service';
import { TruncatableService } from '../../../../../shared/truncatable/truncatable.service';
import { WorkflowItemSearchResultAdminWorkflowListElementComponent } from './workflow-item-search-result-admin-workflow-list-element.component';

describe('WorkflowItemSearchResultAdminWorkflowListElementComponent', () => {
  let component: WorkflowItemSearchResultAdminWorkflowListElementComponent;
  let fixture: ComponentFixture<WorkflowItemSearchResultAdminWorkflowListElementComponent>;
  let id;
  let wfi;
  let itemRD$;
  let linkService;
  let object;

  function init() {
    itemRD$ = createSuccessfulRemoteDataObject$(new Item());
    id = '780b2588-bda5-4112-a1cd-0b15000a5339';
    object = new WorkflowItemSearchResult();
    wfi = new WorkflowItem();
    wfi.item = itemRD$;
    object.indexableObject = wfi;
    linkService = getMockLinkService();
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule(
      {
        imports: [
          NoopAnimationsModule,
          TranslateModule.forRoot(),
          RouterTestingModule.withRoutes([]),
          WorkflowItemSearchResultAdminWorkflowListElementComponent,
        ],
        providers: [
          { provide: TruncatableService, useValue: mockTruncatableService },
          { provide: LinkService, useValue: linkService },
          { provide: DSONameService, useClass: DSONameServiceMock },
          { provide: APP_CONFIG, useValue: environment },
          { provide: ThemeService, useValue: getMockThemeService() },
          { provide: AuthService, useValue: new AuthServiceMock() },
          { provide: AuthorizationDataService, useValue: {} },
          { provide: XSRFService, useValue: {} },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
      .compileComponents();
  }));

  beforeEach(() => {
    linkService.resolveLink.and.callFake((a) => a);
    fixture = TestBed.createComponent(WorkflowItemSearchResultAdminWorkflowListElementComponent);
    component = fixture.componentInstance;
    component.object = object;
    component.linkTypes = CollectionElementLinkType;
    component.index = 0;
    component.viewModes = ViewMode;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve the item using the link service', () => {
    expect(linkService.resolveLink).toHaveBeenCalledWith(wfi, followLink('item'));
  });
});
