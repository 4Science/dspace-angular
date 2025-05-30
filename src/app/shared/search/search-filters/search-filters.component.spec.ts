import {
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { APP_CONFIG } from '../../../../config/app-config.interface';
import { environment } from '../../../../environments/environment';
import { SearchService } from '../../../core/shared/search/search.service';
import { SearchFilterService } from '../../../core/shared/search/search-filter.service';
import { SEARCH_CONFIG_SERVICE } from '../../../my-dspace-page/my-dspace-configuration.service';
import { SearchConfigurationServiceStub } from '../../testing/search-configuration-service.stub';
import { SearchFilterServiceStub } from '../../testing/search-filter-service.stub';
import { SearchServiceStub } from '../../testing/search-service.stub';
import { SearchFiltersComponent } from './search-filters.component';

describe('SearchFiltersComponent', () => {
  let comp: SearchFiltersComponent;
  let fixture: ComponentFixture<SearchFiltersComponent>;

  const searchServiceStub = {
    /* eslint-disable no-empty,@typescript-eslint/no-empty-function */
    getConfig: () =>
      observableOf({ hasSucceeded: true, payload: [] }),
    getClearFiltersQueryParams: () => {
    },
    getSearchLink: () => {
    },
    getConfigurationSearchConfig: () => { },
    /* eslint-enable no-empty, @typescript-eslint/no-empty-function */
  };

  const searchFiltersStub = {
    getSelectedValuesForFilter: (filter) =>
      [],
  };

  let searchService: SearchServiceStub;
  let searchFilters: SearchFilterServiceStub;

  beforeEach(waitForAsync(() => {
    searchService = new SearchServiceStub();
    searchFilters = new SearchFilterServiceStub();

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterModule.forRoot([]),
        NoopAnimationsModule,
        SearchFiltersComponent,
      ],
      providers: [
        { provide: SearchService, useValue: searchService },
        { provide: SEARCH_CONFIG_SERVICE, useValue: new SearchConfigurationServiceStub() },
        { provide: SearchFilterService, useValue: searchFilters },
        { provide: APP_CONFIG, useValue: environment },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).overrideComponent(SearchFiltersComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFiltersComponent);
    comp = fixture.componentInstance; // SearchFiltersComponent test instance
    fixture.detectChanges();
  });

  describe('when the getSearchLink method is called', () => {
    beforeEach(() => {
      spyOn(searchService, 'getSearchLink');
      comp.getSearchLink();
    });

    it('should call getSearchLink on the searchService', () => {
      expect(searchService.getSearchLink).toHaveBeenCalled();
    });
  });

  describe('when there are no filters', () => {
    beforeEach(() => {
      (comp as any).ngOnInit();
      (comp as any).availableFilters$.next(false);
      fixture.detectChanges();
    });

    it('should not render component', () => {
      const menu = fixture.debugElement.query(By.css('div.d-none'));
      expect(menu).not.toBeNull();
    });

  });

});
