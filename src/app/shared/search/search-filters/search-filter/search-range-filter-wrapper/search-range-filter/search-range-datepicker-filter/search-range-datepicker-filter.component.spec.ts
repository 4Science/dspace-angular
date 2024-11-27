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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  of as observableOf,
  of,
} from 'rxjs';

import { RemoteDataBuildService } from '../../../../../../../core/cache/builders/remote-data-build.service';
import { SearchService } from '../../../../../../../core/shared/search/search.service';
import {
  FILTER_CONFIG,
  IN_PLACE_SEARCH,
  REFRESH_FILTER,
  SCOPE,
  SearchFilterService,
} from '../../../../../../../core/shared/search/search-filter.service';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../../my-dspace-page/my-dspace-page.component';
import { RouterStub } from '../../../../../../testing/router.stub';
import { SearchConfigurationServiceStub } from '../../../../../../testing/search-configuration-service.stub';
import { SearchServiceStub } from '../../../../../../testing/search-service.stub';
import { SearchFilterConfig } from '../../../../../models/search-filter-config.model';
import { SearchRangeFilterComponent } from '../search-range-filter.component';
import { SearchRangeDatepickerFilterComponent } from './search-range-datepicker-filter.component';

describe('SearchRangeDatepickerFilterComponent', () => {
  let component: SearchRangeDatepickerFilterComponent;
  let fixture: ComponentFixture<SearchRangeDatepickerFilterComponent>;
  const mockFilterConfig: SearchFilterConfig = new SearchFilterConfig();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot(), NoopAnimationsModule, FormsModule, SearchRangeFilterComponent],
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
                },
                /* eslint-enable no-empty, @typescript-eslint/no-empty-function */
            },
        },
        { provide: SCOPE, useValue: 'test' },
    ],
    schemas: [NO_ERRORS_SCHEMA],
}).overrideComponent(SearchRangeFilterComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
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
