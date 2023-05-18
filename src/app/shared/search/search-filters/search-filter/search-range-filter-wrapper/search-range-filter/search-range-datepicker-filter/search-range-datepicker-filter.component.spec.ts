import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchRangeDatepickerFilterComponent } from './search-range-datepicker-filter.component';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SearchRangeFilterComponent } from '../search-range-filter.component';
import { SearchService } from '../../../../../../../core/shared/search/search.service';
import { SearchServiceStub } from '../../../../../../testing/search-service.stub';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterStub } from '../../../../../../testing/router.stub';
import {
  FILTER_CONFIG,
  IN_PLACE_SEARCH,
  REFRESH_FILTER,
  SearchFilterService
} from '../../../../../../../core/shared/search/search-filter.service';
import { RemoteDataBuildService } from '../../../../../../../core/cache/builders/remote-data-build.service';
import { BehaviorSubject, of, of as observableOf } from 'rxjs';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationServiceStub } from '../../../../../../testing/search-configuration-service.stub';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { SearchFilterConfig } from '../../../../../models/search-filter-config.model';

describe('SearchRangeDatepickerFilterComponent', () => {
  let component: SearchRangeDatepickerFilterComponent;
  let fixture: ComponentFixture<SearchRangeDatepickerFilterComponent>;
  const mockFilterConfig: SearchFilterConfig = new SearchFilterConfig();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NoopAnimationsModule, FormsModule],
      declarations: [SearchRangeFilterComponent],
      providers: [
        { provide: SearchService, useValue: new SearchServiceStub() },
        { provide: Router, useValue: new RouterStub() },
        { provide: FILTER_CONFIG, useValue: mockFilterConfig },
        { provide: RemoteDataBuildService, useValue: { aggregate: () => observableOf({}) } },
        { provide: ActivatedRoute, useValue: { queryParamMap: observableOf({ get: () => null }) } },
        { provide: SEARCH_CONFIG_SERVICE, useValue: new SearchConfigurationServiceStub() },
        { provide: IN_PLACE_SEARCH, useValue: false },
        { provide: REFRESH_FILTER, useValue: new BehaviorSubject<boolean>(false) },
        {
          provide: SearchFilterService, useValue: {
            getSelectedValuesForFilter: () => of([]),
            isFilterActiveWithValue: (paramName: string, filterValue: string) => true,
            getPage: (paramName: string) => of(0),
            /* eslint-disable no-empty,@typescript-eslint/no-empty-function */
            incrementPage: (filterName: string) => {
            },
            resetPage: (filterName: string) => {
            }
            /* eslint-enable no-empty, @typescript-eslint/no-empty-function */
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(SearchRangeFilterComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchRangeDatepickerFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
