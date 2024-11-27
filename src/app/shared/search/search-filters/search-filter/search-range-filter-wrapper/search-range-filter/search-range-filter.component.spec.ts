import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
  PLATFORM_ID,
} from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  of as observableOf,
} from 'rxjs';

import { RemoteDataBuildService } from '../../../../../../core/cache/builders/remote-data-build.service';
import { buildPaginatedList } from '../../../../../../core/data/paginated-list.model';
import { PageInfo } from '../../../../../../core/shared/page-info.model';
import { SearchService } from '../../../../../../core/shared/search/search.service';
import {
  IN_PLACE_SEARCH,
  REFRESH_FILTER, SCOPE,
  SearchFilterService
} from '../../../../../../core/shared/search/search-filter.service';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../my-dspace-page/my-dspace-configuration.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../remote-data.utils';
import { RouterStub } from '../../../../../testing/router.stub';
import { SearchConfigurationServiceStub } from '../../../../../testing/search-configuration-service.stub';
import { SearchServiceStub } from '../../../../../testing/search-service.stub';
import { FacetValue } from '../../../../models/facet-value.model';
import { FilterType } from '../../../../models/filter-type.model';
import { SearchFilterConfig } from '../../../../models/search-filter-config.model';
import { SearchRangeFilterComponent } from './search-range-filter.component';
import { RouteService } from '../../../../../../core/services/route.service';
import { SearchFilterServiceStub } from '../../../../../testing/search-filter-service.stub';
import { routeServiceStub } from '../../../../../testing/route-service.stub';
import { ActivatedRouteStub } from '../../../../../testing/active-router.stub';
import {
  SearchFacetRangeOptionComponent
} from '../../search-facet-filter-options/search-facet-range-option/search-facet-range-option.component';

xdescribe('SearchRangeFilterComponent', () => {
  let comp: SearchRangeFilterComponent;
  let fixture: ComponentFixture<SearchRangeFilterComponent>;
  const minSuffix = '.min';
  const maxSuffix = '.max';
  const filterName1 = 'test name';
  const value1 = '2000 - 2012';
  const value2 = '1992 - 2000';
  const value3 = '1990 - 1992';
  const mockFilterConfig: SearchFilterConfig = Object.assign(new SearchFilterConfig(), {
    name: filterName1,
    filterType: FilterType.range,
    hasFacets: false,
    isOpenByDefault: false,
    pageSize: 2,
    minValue: 200,
    maxValue: 3000,
  });
  const values: FacetValue[] = [
    {
      label: value1,
      value: value1,
      count: 52,
      _links: {
        self: {
          href: '',
        },
        search: {
          href: '',
        },
      },
    }, {
      label: value2,
      value: value2,
      count: 20,
      _links: {
        self: {
          href: '',
        },
        search: {
          href: '',
        },
      },
    }, {
      label: value3,
      value: value3,
      count: 5,
      _links: {
        self: {
          href: '',
        },
        search: {
          href: '',
        },
      },
    },
  ];

  const selectedValues = observableOf([value1]);
  const page = observableOf(0);
  const platformId = 'Chrome';

  const mockValues = createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), values));

  const searchLink = '/search';
  let filterService: SearchFilterServiceStub;
  let router: RouterStub;
  let searchService: SearchServiceStub;

  beforeEach(waitForAsync(() => {
    filterService = new SearchFilterServiceStub();
    router = new RouterStub();
    searchService =  new SearchServiceStub(searchLink);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NoopAnimationsModule, FormsModule, SearchRangeFilterComponent],
      providers: [
        { provide: SearchService, useValue: searchService },
        { provide: SearchFilterService, useValue: filterService },
        { provide: Router, useValue: router },
        { provide: RouteService, useValue: routeServiceStub },
        { provide: RemoteDataBuildService, useValue: { aggregate: () => observableOf({}), getQueryParameterValue: () => observableOf({}) } },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        { provide: SEARCH_CONFIG_SERVICE, useValue: new SearchConfigurationServiceStub() },
        { provide: IN_PLACE_SEARCH, useValue: false },
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: REFRESH_FILTER, useValue: new BehaviorSubject<boolean>(false) },
        { provide: SCOPE, useValue: undefined },
        {
          provide: SearchFilterService, useValue: {
            getSelectedValuesForFilter: () => selectedValues,
            isFilterActiveWithValue: (paramName: string, filterValue: string) => true,
            getPage: (paramName: string) => page,
            /* eslint-disable no-empty,@typescript-eslint/no-empty-function */
            incrementPage: (filterName: string) => {
            },
            resetPage: (filterName: string) => {
            },
            /* eslint-enable no-empty, @typescript-eslint/no-empty-function */
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).overrideComponent(SearchRangeFilterComponent, {
      remove: {
        imports: [
          SearchFacetRangeOptionComponent,
        ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchRangeFilterComponent);
    comp = fixture.componentInstance; // SearchPageComponent test instance
    comp.filterConfig = mockFilterConfig;
    comp.inPlaceSearch = false;
    comp.refreshFilters = new BehaviorSubject<boolean>(false);
    spyOn(searchService, 'getFacetValuesFor').and.returnValue(mockValues);
    fixture.detectChanges();
  });

  xdescribe('when the onSubmit method is called with data', () => {
    const searchUrl = '/search/path';
    // const data = { [mockFilterConfig.paramName + minSuffix]: '1900', [mockFilterConfig.paramName + maxSuffix]: '1950' };
    beforeEach(() => {
      comp.range = [1900, 1950];
      spyOn(comp, 'getSearchLink').and.returnValue(searchUrl);
      comp.onSubmit();
    });

    it('should call navigate on the router with the right searchlink and parameters', () => {
      expect(router.navigate).toHaveBeenCalledWith(searchUrl.split('/'), {
        queryParams: {
          [mockFilterConfig.paramName + minSuffix]: [1900],
          [mockFilterConfig.paramName + maxSuffix]: [1950],
        },
        queryParamsHandling: 'merge',
      });
    });
  });
});
