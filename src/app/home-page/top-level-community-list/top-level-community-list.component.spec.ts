import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { APP_CONFIG } from 'src/config/app-config.interface';
import { environment } from 'src/environments/environment.test';

import { CommunityDataService } from '../../core/data/community-data.service';
import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { FindListOptions } from '../../core/data/find-list-options.model';
import { buildPaginatedList } from '../../core/data/paginated-list.model';
import { GroupDataService } from '../../core/eperson/group-data.service';
import { PaginationService } from '../../core/pagination/pagination.service';
import { LinkHeadService } from '../../core/services/link-head.service';
import { Community } from '../../core/shared/community.model';
import { ConfigurationProperty } from '../../core/shared/configuration-property.model';
import { PageInfo } from '../../core/shared/page-info.model';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { HostWindowService } from '../../shared/host-window.service';
import { getMockThemeService } from '../../shared/mocks/theme-service.mock';
import { SelectableListService } from '../../shared/object-list/selectable-list/selectable-list.service';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { HostWindowServiceStub } from '../../shared/testing/host-window-service.stub';
import { PaginationServiceStub } from '../../shared/testing/pagination-service.stub';
import { SearchConfigurationServiceStub } from '../../shared/testing/search-configuration-service.stub';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { ThemeService } from '../../shared/theme-support/theme.service';
import { TopLevelCommunityListComponent } from './top-level-community-list.component';

describe('TopLevelCommunityListComponent', () => {
  let comp: TopLevelCommunityListComponent;
  let fixture: ComponentFixture<TopLevelCommunityListComponent>;
  let communityDataServiceStub: any;
  let paginationService;
  let themeService;

  const topCommList = [Object.assign(new Community(), {
    id: '123456789-1',
    metadata: {
      'dc.title': [
        { language: 'en_US', value: 'TopCommunity 1' },
      ],
    },
  }),
  Object.assign(new Community(), {
    id: '123456789-2',
    metadata: {
      'dc.title': [
        { language: 'en_US', value: 'TopCommunity 2' },
      ],
    },
  }),
  Object.assign(new Community(), {
    id: '123456789-3',
    metadata: {
      'dc.title': [
        { language: 'en_US', value: 'TopCommunity 3' },
      ],
    },
  }),
  Object.assign(new Community(), {
    id: '12345678942',
    metadata: {
      'dc.title': [
        { language: 'en_US', value: 'TopCommunity 4' },
      ],
    },
  }),
  Object.assign(new Community(), {
    id: '123456789-5',
    metadata: {
      'dc.title': [
        { language: 'en_US', value: 'TopCommunity 5' },
      ],
    },
  }),
  Object.assign(new Community(), {
    id: '123456789-6',
    metadata: {
      'dc.title': [
        { language: 'en_US', value: 'TopCommunity 6' },
      ],
    },
  }),
  Object.assign(new Community(), {
    id: '123456789-7',
    metadata: {
      'dc.title': [
        { language: 'en_US', value: 'TopCommunity 7' },
      ],
    },
  }),
  ];

  communityDataServiceStub = {
    findTop(options: FindListOptions = {}) {
      let currentPage = options.currentPage;
      let elementsPerPage = options.elementsPerPage;
      if (currentPage === undefined) {
        currentPage = 1;
      }
      elementsPerPage = 5;

      const startPageIndex = (currentPage - 1) * elementsPerPage;
      let endPageIndex = (currentPage * elementsPerPage);
      if (endPageIndex > topCommList.length) {
        endPageIndex = topCommList.length;
      }
      return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), topCommList.slice(startPageIndex, endPageIndex)));

    },
  };

  paginationService = new PaginationServiceStub();

  themeService = getMockThemeService();

  const linkHeadService = jasmine.createSpyObj('linkHeadService', {
    addTag: '',
  });

  const groupDataService = jasmine.createSpyObj('groupsDataService', {
    findListByHref: createSuccessfulRemoteDataObject$(createPaginatedList([])),
    getGroupRegistryRouterLink: '',
    getUUIDFromString: '',
  });

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: createSuccessfulRemoteDataObject$(Object.assign(new ConfigurationProperty(), {
      name: 'test',
      values: [
        'org.dspace.ctask.general.ProfileFormats = test',
      ],
    })),
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        NgbModule,
        NoopAnimationsModule,
        TopLevelCommunityListComponent,
      ],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
        { provide: CommunityDataService, useValue: communityDataServiceStub },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(0) },
        { provide: PaginationService, useValue: paginationService },
        { provide: SelectableListService, useValue: {} },
        { provide: ThemeService, useValue: themeService },
        { provide: GroupDataService, useValue: groupDataService },
        { provide: LinkHeadService, useValue: linkHeadService },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: SearchConfigurationService, useValue: new SearchConfigurationServiceStub() },
        provideMockStore(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopLevelCommunityListComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();

  });


  it('should display a list of top-communities', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const subComList = fixture.debugElement.queryAll(By.css('li'));

    expect(subComList.length).toEqual(5);
    expect(subComList[0].nativeElement.textContent).toContain('TopCommunity 1');
    expect(subComList[1].nativeElement.textContent).toContain('TopCommunity 2');
    expect(subComList[2].nativeElement.textContent).toContain('TopCommunity 3');
    expect(subComList[3].nativeElement.textContent).toContain('TopCommunity 4');
    expect(subComList[4].nativeElement.textContent).toContain('TopCommunity 5');
  });

});
