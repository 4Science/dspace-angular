import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  Router,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { PaginationService } from '@dspace/core';
import { PaginationComponentOptions } from '@dspace/core';
import { FacetValue } from '@dspace/core';
import { FilterType } from '@dspace/core';
import { SearchFilterConfig } from '@dspace/core';
import { SearchService } from '@dspace/core';
import { SearchConfigurationService } from '@dspace/core';
import { SearchFilterService } from '@dspace/core';
import { PaginationServiceStub } from '@dspace/core';
import { RouterStub } from '@dspace/core';
import { SearchServiceStub } from '@dspace/core';
import { ShortNumberPipe } from '../../../../../utils/short-number.pipe';
import {
  RANGE_FILTER_MAX_SUFFIX,
  RANGE_FILTER_MIN_SUFFIX,
} from '../../search-range-filter/search-range-filter-constants';
import { SearchFacetRangeOptionComponent } from './search-facet-range-option.component';

describe('SearchFacetRangeOptionComponent', () => {
  let comp: SearchFacetRangeOptionComponent;
  let fixture: ComponentFixture<SearchFacetRangeOptionComponent>;
  const filterName1 = 'test name';
  const value2 = '20 - 30';
  const mockFilterConfig = Object.assign(new SearchFilterConfig(), {
    name: filterName1,
    type: FilterType.range,
    hasFacets: false,
    isOpenByDefault: false,
    pageSize: 2,
    minValue: 200,
    maxValue: 3000,
  });
  const value: FacetValue = {
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
  };

  const searchLink = '/search';
  let filterService;
  let searchService;
  let router;
  const page = observableOf(0);

  const pagination = Object.assign(new PaginationComponentOptions(), { id: 'page-id', currentPage: 1, pageSize: 20 });
  const paginationService = new PaginationServiceStub(pagination);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NoopAnimationsModule, FormsModule, SearchFacetRangeOptionComponent, ShortNumberPipe],
      providers: [
        { provide: SearchService, useValue: new SearchServiceStub(searchLink) },
        { provide: Router, useValue: new RouterStub() },
        { provide: PaginationService, useValue: paginationService },
        {
          provide: SearchConfigurationService, useValue: {
            searchOptions: observableOf({}),
            paginationId: 'page-id',
          },
        },
        {
          provide: SearchFilterService, useValue: {
            isFilterActiveWithValue: (paramName: string, filterValue: string) => observableOf(true),
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
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(SearchFacetRangeOptionComponent, {
      remove: {
        imports: [RouterLink],
      },
      add: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFacetRangeOptionComponent);
    comp = fixture.componentInstance; // SearchFacetRangeOptionComponent test instance
    filterService = (comp as any).filterService;
    searchService = (comp as any).searchService;
    router = (comp as any).router;
    comp.filterValue = value;
    comp.filterConfig = mockFilterConfig;
    fixture.detectChanges();
  });

  describe('when the updateChangeParams method is called with a value', () => {
    it('should update the changeQueryParams with the new parameter values', () => {
      comp.changeQueryParams = {};
      comp.filterValue = {
        label: '50-60',
        value: '50-60',
        count: 20,
        _links: {
          self: {
            href: '',
          },
          search: {
            href: '',
          },
        },
      };
      (comp as any).updateChangeParams();
      expect(comp.changeQueryParams).toEqual({
        [mockFilterConfig.paramName + RANGE_FILTER_MIN_SUFFIX]: [50],
        [mockFilterConfig.paramName + RANGE_FILTER_MAX_SUFFIX]: [60],
        ['page-id.page']: 1,
      });
    });
  });

  describe('when isVisible emits true', () => {
    it('the facet option should be visible', () => {
      comp.isVisible = observableOf(true);
      fixture.detectChanges();
      const linkEl = fixture.debugElement.query(By.css('a'));
      expect(linkEl).not.toBeNull();
    });
  });

  describe('when isVisible emits false', () => {
    it('the facet option should not be visible', () => {
      comp.isVisible = observableOf(false);
      fixture.detectChanges();
      const linkEl = fixture.debugElement.query(By.css('a'));
      expect(linkEl).toBeNull();
    });
  });
});
