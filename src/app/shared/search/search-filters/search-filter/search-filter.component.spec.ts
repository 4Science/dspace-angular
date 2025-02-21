import {
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { cold } from 'jasmine-marbles';
import {
  Observable,
  of as observableOf,
} from 'rxjs';
import { SearchFilterService } from '@dspace/core';

import { AppliedFilter } from '@dspace/core';
import { FacetValues } from '@dspace/core';
import { FilterType } from '@dspace/core';
import { SearchFilterConfig } from '@dspace/core';
import { SearchService } from '@dspace/core';
import { SequenceService } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { SearchConfigurationServiceStub } from '@dspace/core';
import { SearchFilterServiceStub } from '@dspace/core';
import { SearchServiceStub } from '@dspace/core';
import { SEARCH_CONFIG_SERVICE } from '../../../../my-dspace-page/my-dspace-configuration.service';
import { SearchFacetFilterWrapperComponent } from './search-facet-filter-wrapper/search-facet-filter-wrapper.component';
import { SearchFilterComponent } from './search-filter.component';

describe('SearchFilterComponent', () => {
  let comp: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;

  const appliedFilter1: AppliedFilter = Object.assign(new AppliedFilter(), {
    operator: 'equals',
  });
  const appliedFilter2: AppliedFilter = Object.assign(new AppliedFilter(), {
    operator: 'notauthority',
  });

  const filterName1 = 'test name';

  const mockFilterConfig: SearchFilterConfig = Object.assign(new SearchFilterConfig(), {
    name: filterName1,
    filterType: FilterType.text,
    hasFacets: false,
    isOpenByDefault: false,
  });
  let searchFilterService: SearchFilterServiceStub;
  let sequenceService;
  let searchService: SearchServiceStub;
  let searchConfigurationService: SearchConfigurationServiceStub;

  beforeEach(waitForAsync(() => {
    searchFilterService = new SearchFilterServiceStub();
    searchService = new SearchServiceStub();
    searchConfigurationService = new SearchConfigurationServiceStub();
    sequenceService = jasmine.createSpyObj('sequenceService', { next: 17 });

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterModule.forRoot([]),
        SearchFilterComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: SearchService, useValue: searchService },
        { provide: SearchFilterService, useValue: searchFilterService },
        { provide: SEARCH_CONFIG_SERVICE, useValue: searchConfigurationService },
        { provide: SequenceService, useValue: sequenceService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).overrideComponent(SearchFilterComponent, {
      add: { changeDetection: ChangeDetectionStrategy.Default },
      remove: { imports: [SearchFacetFilterWrapperComponent] },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFilterComponent);
    comp = fixture.componentInstance; // SearchPageComponent test instance
    comp.filter = mockFilterConfig;
    fixture.detectChanges();
  });

  it('should generate unique IDs', () => {
    expect(sequenceService.next).toHaveBeenCalled();
    expect(comp.toggleId).toContain('17');
    expect(comp.regionId).toContain('17');
  });

  describe('when the toggle method is triggered', () => {
    beforeEach(() => {
      spyOn(searchFilterService, 'toggle');
      comp.toggle();
    });

    it('should call toggle with the correct filter configuration name', () => {
      expect(searchFilterService.toggle).toHaveBeenCalledWith(mockFilterConfig.name);
    });
  });

  describe('when the initializeFilter method is triggered', () => {
    beforeEach(() => {
      spyOn(searchFilterService, 'initializeFilter');
      comp.initializeFilter();
    });

    it('should call initialCollapse with the correct filter configuration name', () => {
      expect(searchFilterService.initializeFilter).toHaveBeenCalledWith(mockFilterConfig);
    });
  });

  describe('when isCollapsed is called and the filter is collapsed', () => {
    let isActive: Observable<boolean>;
    beforeEach(() => {
      searchFilterService.isCollapsed = () => observableOf(true);
      isActive = (comp as any).isCollapsed();
    });

    it('should return an observable containing true', () => {
      const sub = isActive.subscribe((value) => {
        expect(value).toBeTruthy();
      });
      sub.unsubscribe();
    });
  });

  describe('when isCollapsed is called and the filter is not collapsed', () => {
    let isActive: Observable<boolean>;
    beforeEach(() => {
      searchFilterService.isCollapsed = () => observableOf(false);
      isActive = (comp as any).isCollapsed();
    });

    it('should return an observable containing false', () => {
      const sub = isActive.subscribe((value) => {
        expect(value).toBeFalsy();
      });
      sub.unsubscribe();
    });
  });

  describe('isActive', () => {
    it('should return true when there are facet value suggestions & no valid applied values', () => {
      spyOn(searchService, 'getFacetValuesFor').and.returnValue(createSuccessfulRemoteDataObject$(Object.assign(new FacetValues(), {
        pageInfo: {
          totalElements: 5,
        },
      } as FacetValues)));
      comp.appliedFilters$ = observableOf([appliedFilter2]);

      expect(comp.isActive()).toBeObservable(cold('(tt)', {
        t: true,
      }));
    });

    it('should return false when there are no facet value suggestions & no valid applied values', () => {
      spyOn(searchService, 'getFacetValuesFor').and.returnValue(createSuccessfulRemoteDataObject$(Object.assign(new FacetValues(), {
        pageInfo: {
          totalElements: 0,
        },
      } as FacetValues)));
      comp.appliedFilters$ = observableOf([appliedFilter2]);

      expect(comp.isActive()).toBeObservable(cold('(tf)', {
        t: true,
        f: false,
      }));
    });

    it('should return true when there are no facet value suggestions & but there are valid applied values', () => {
      spyOn(searchService, 'getFacetValuesFor').and.returnValue(createSuccessfulRemoteDataObject$(Object.assign(new FacetValues(), {
        pageInfo: {
          totalElements: 0,
        },
      } as FacetValues)));
      comp.appliedFilters$ = observableOf([appliedFilter1, appliedFilter2]);

      expect(comp.isActive()).toBeObservable(cold('(tt)', {
        t: true,
      }));
    });

    it('should return true when there are facet value suggestions & there are valid applied values', () => {
      spyOn(searchService, 'getFacetValuesFor').and.returnValue(createSuccessfulRemoteDataObject$(Object.assign(new FacetValues(), {
        pageInfo: {
          totalElements: 5,
        },
      } as FacetValues)));
      comp.appliedFilters$ = observableOf([appliedFilter1, appliedFilter2]);

      expect(comp.isActive()).toBeObservable(cold('(tt)', {
        t: true,
      }));
    });
  });
});
