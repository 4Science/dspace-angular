import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import {
  SortDirection,
  SortOptions,
} from '@dspace/core';
import { ConfigurationDataService } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { GroupDataService } from '@dspace/core';
import { RouterMock } from '@dspace/core';
import { getMockTranslateService } from '@dspace/core';
import { PaginationService } from '@dspace/core';
import { LinkHeadService } from '@dspace/core';
import { Collection } from '@dspace/core';
import { ConfigurationProperty } from '@dspace/core';
import { PaginatedSearchOptions } from '@dspace/core';
import { PaginationComponentOptions } from '@dspace/core';
import { SearchFilter } from '@dspace/core';
import { SearchConfigurationService } from '@dspace/core';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '@dspace/core';
import { PaginationServiceStub } from '@dspace/core';
import { SearchConfigurationServiceStub } from '@dspace/core';
import { createPaginatedList } from '@dspace/core';
import { MockActivatedRoute } from '../mocks/active-router.mock';
import { RSSComponent } from './rss.component';

describe('RssComponent', () => {
  let comp: RSSComponent;
  let options: SortOptions;
  let fixture: ComponentFixture<RSSComponent>;
  let uuid: string;
  let query: string;
  let groupDataService: GroupDataService;
  let linkHeadService: LinkHeadService;
  let configurationDataService: ConfigurationDataService;
  let paginationService;

  beforeEach(waitForAsync(() => {
    const mockCollection: Collection = Object.assign(new Collection(), {
      id: 'ce41d451-97ed-4a9c-94a1-7de34f16a9f4',
      name: 'test-collection',
      _links: {
        mappedItems: {
          href: 'https://rest.api/collections/ce41d451-97ed-4a9c-94a1-7de34f16a9f4/mappedItems',
        },
        self: {
          href: 'https://rest.api/collections/ce41d451-97ed-4a9c-94a1-7de34f16a9f4',
        },
      },
    });
    configurationDataService = jasmine.createSpyObj('configurationDataService', {
      findByPropertyName: createSuccessfulRemoteDataObject$(Object.assign(new ConfigurationProperty(), {
        name: 'test',
        values: [
          'org.dspace.ctask.general.ProfileFormats = test',
        ],
      })),
    });
    linkHeadService = jasmine.createSpyObj('linkHeadService', {
      addTag: '',
    });
    const mockCollectionRD: RemoteData<Collection> = createSuccessfulRemoteDataObject(mockCollection);
    const mockSearchOptions = observableOf(new PaginatedSearchOptions({
      pagination: Object.assign(new PaginationComponentOptions(), {
        id: 'search-page-configuration',
        pageSize: 10,
        currentPage: 1,
      }),
      sort: new SortOptions('dc.title', SortDirection.ASC),
    }));
    groupDataService = jasmine.createSpyObj('groupsDataService', {
      findListByHref: createSuccessfulRemoteDataObject$(createPaginatedList([])),
      getGroupRegistryRouterLink: '',
      getUUIDFromString: '',
    });
    paginationService = new PaginationServiceStub();
    const searchConfigService = {
      paginatedSearchOptions: mockSearchOptions,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: GroupDataService, useValue: groupDataService },
        { provide: LinkHeadService, useValue: linkHeadService },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: SearchConfigurationService, useValue: new SearchConfigurationServiceStub() },
        { provide: PaginationService, useValue: paginationService },
        { provide: Router, useValue: new RouterMock() },
        { provide: ActivatedRoute, useValue: new MockActivatedRoute },
        { provide: TranslateService, useValue: getMockTranslateService() },
      ],
      declarations: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    options = new SortOptions('dc.title', SortDirection.DESC);
    uuid = '2cfcf65e-0a51-4bcb-8592-b8db7b064790';
    query = 'test';
    fixture = TestBed.createComponent(RSSComponent);
    comp = fixture.componentInstance;
  });

  it('should formulate the correct url given params in url', () => {
    const route = comp.formulateRoute(uuid, 'opensearch/search', options, query);
    expect(route).toBe('/opensearch/search?format=atom&scope=2cfcf65e-0a51-4bcb-8592-b8db7b064790&sort=dc.title&sort_direction=DESC&query=test');
  });

  it('should skip uuid if its null', () => {
    const route = comp.formulateRoute(null, 'opensearch/search', options, query);
    expect(route).toBe('/opensearch/search?format=atom&sort=dc.title&sort_direction=DESC&query=test');
  });

  it('should default to query * if none provided', () => {
    const route = comp.formulateRoute(null, 'opensearch/search', options, null);
    expect(route).toBe('/opensearch/search?format=atom&sort=dc.title&sort_direction=DESC&query=*');
  });

  it('should include filters in opensearch url if provided', () => {
    const filters = [
      new SearchFilter('f.test', ['value','another value'], 'contains'), // should be split into two arguments, spaces should be URI-encoded
      new SearchFilter('f.range', ['[1987 TO 1988]'], 'equals'), // value should be URI-encoded, ',equals' should not
    ];
    const route = comp.formulateRoute(uuid, 'opensearch/search', options, query, filters);
    expect(route).toBe('/opensearch/search?format=atom&scope=2cfcf65e-0a51-4bcb-8592-b8db7b064790&sort=dc.title&sort_direction=DESC&query=test&f.test=value,contains&f.test=another%20value,contains&f.range=%5B1987%20TO%201988%5D,equals');
  });

  it('should include configuration in opensearch url if provided', () => {
    const route = comp.formulateRoute(uuid, 'opensearch/search', options, query, null, 'adminConfiguration');
    expect(route).toBe('/opensearch/search?format=atom&scope=2cfcf65e-0a51-4bcb-8592-b8db7b064790&sort=dc.title&sort_direction=DESC&query=test&configuration=adminConfiguration');
  });

  it('should include rpp in opensearch url if provided', () => {
    const route = comp.formulateRoute(uuid, 'opensearch/search', options, query, null, null, 50);
    expect(route).toBe('/opensearch/search?format=atom&scope=2cfcf65e-0a51-4bcb-8592-b8db7b064790&sort=dc.title&sort_direction=DESC&query=test&rpp=50');
  });
});

