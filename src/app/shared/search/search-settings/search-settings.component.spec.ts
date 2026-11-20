import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  provideRouter,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  of,
} from 'rxjs';
import { map } from 'rxjs/operators';

import {
  SortDirection,
  SortOptions,
} from '../../../core/cache/models/sort-options.model';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { SearchService } from '../../../core/shared/search/search.service';
import { SearchFilterService } from '../../../core/shared/search/search-filter.service';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { SEARCH_CONFIG_SERVICE } from '../../../my-dspace-page/my-dspace-configuration.service';
import { PageSizeSelectorComponent } from '../../page-size-selector/page-size-selector.component';
import { PaginationComponentOptions } from '../../pagination/pagination-component-options.model';
import { SidebarService } from '../../sidebar/sidebar.service';
import { SidebarDropdownComponent } from '../../sidebar/sidebar-dropdown.component';
import { ActivatedRouteStub } from '../../testing/active-router.stub';
import { PaginationServiceStub } from '../../testing/pagination-service.stub';
import { SearchServiceStub } from '../../testing/search-service.stub';
import { SidebarServiceStub } from '../../testing/sidebar-service.stub';
import { EnumKeysPipe } from '../../utils/enum-keys-pipe';
import { VarDirective } from '../../utils/var.directive';
import { SearchSettingsComponent } from './search-settings.component';

describe('SearchSettingsComponent', () => {

  let comp: SearchSettingsComponent;
  let fixture: ComponentFixture<SearchSettingsComponent>;

  let pagination: PaginationComponentOptions;
  let sort: SortOptions;

  let queryParam;
  let scopeParam;
  let paginatedSearchOptions;

  let paginationService: PaginationServiceStub;

  // Emulates the `view` query parameter (null when it is not in the URL)
  let viewQueryParam$: BehaviorSubject<string>;


  beforeEach(waitForAsync(async () => {
    pagination = new PaginationComponentOptions();
    pagination.id = 'search-results-pagination';
    pagination.currentPage = 1;
    pagination.pageSize = 10;
    sort = new SortOptions('score', SortDirection.DESC);

    queryParam = 'test query';
    scopeParam = '7669c72a-3f2a-451f-a3b9-9210e7a4c02f';
    paginatedSearchOptions = {
      query: queryParam,
      scope: scopeParam,
      pagination,
      sort,
    };

    paginationService = new PaginationServiceStub(pagination, sort);
    viewQueryParam$ = new BehaviorSubject<string>(null);

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        SearchSettingsComponent,
        EnumKeysPipe,
        VarDirective,
      ],
      providers: [
        provideRouter([]),
        { provide: SearchService, useValue: new SearchServiceStub() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        {
          provide: SidebarService,
          useValue: SidebarServiceStub,
        },
        {
          provide: SearchFilterService,
          useValue: {},
        },
        {
          provide: PaginationService,
          useValue: paginationService,
        },
        {
          provide: SEARCH_CONFIG_SERVICE,
          useValue: {
            paginatedSearchOptions: of(paginatedSearchOptions),
            getCurrentScope: of('test-id'),
            // Same semantics as SearchConfigurationService.getCurrentViewMode: the `view` query
            // parameter wins, the given default is only used when it is missing.
            getCurrentViewMode: (defaultViewMode: ViewMode) => viewQueryParam$.pipe(
              map((view: string) => view || defaultViewMode),
            ),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(SearchSettingsComponent, { remove: { imports: [SidebarDropdownComponent, PageSizeSelectorComponent] } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchSettingsComponent);
    comp = fixture.componentInstance;

    comp.sortOptionsList = [
      new SortOptions('score', SortDirection.DESC),
      new SortOptions('dc.title', SortDirection.ASC),
      new SortOptions('dc.title', SortDirection.DESC),
    ];
    comp.currentSortOption = new SortOptions('score', SortDirection.DESC);

    // SearchPageComponent test instance
    fixture.detectChanges();
    spyOn(comp, 'reloadOrder');
  });

  it('it should show the order settings with the respective selectable options', () => {
    fixture.detectChanges();
    const orderSetting = fixture.debugElement.query(By.css('div.result-order-settings'));
    expect(orderSetting).toBeDefined();
    const childElements = orderSetting.queryAll(By.css('option'));
    expect(childElements.length).toEqual(comp.sortOptionsList.length);
  });

  it('it should show the size settings', () => {
    fixture.detectChanges();
    const pageSizeSetting = fixture.debugElement.query(By.css('page-size-settings'));
    expect(pageSizeSetting).toBeDefined();
  });

  it('should have the proper order value selected by default', () => {
    fixture.detectChanges();
    const orderSetting = fixture.debugElement.query(By.css('div.result-order-settings'));
    const childElementToBeSelected = orderSetting.query(By.css('option[value="score,DESC"]'));
    expect(childElementToBeSelected).not.toBeNull();
    expect(childElementToBeSelected.nativeElement.selected).toBeTrue();
  });

  describe('page size selector visibility', () => {
    const isSelectorShown = (): boolean => fixture.debugElement.query(By.css('ds-page-size-selector')) !== null;

    const init = (initViewMode: ViewMode): void => {
      comp.initViewMode = initViewMode;
      comp.ngOnInit();
      fixture.detectChanges();
    };

    describe('when the URL has no view query parameter', () => {
      it('should use the init view mode (visible view)', () => {
        init(ViewMode.GridElement);
        expect(isSelectorShown()).toBeTrue();
      });

      it('should use the init view mode (hidden view)', () => {
        init(ViewMode.DetailedListElement);
        expect(isSelectorShown()).toBeFalse();
      });
    });

    describe('when the URL defines the view query parameter', () => {
      it('should show the selector for view=grid even if the init view mode is hidden', () => {
        viewQueryParam$.next(ViewMode.GridElement);
        init(ViewMode.DetailedListElement);
        expect(isSelectorShown()).toBeTrue();
      });

      it('should hide the selector for view=detailed even if the init view mode is visible', () => {
        viewQueryParam$.next(ViewMode.DetailedListElement);
        init(ViewMode.ListElement);
        expect(isSelectorShown()).toBeFalse();
      });

      it('should follow the view query parameter when it changes', () => {
        init(ViewMode.ListElement);
        expect(isSelectorShown()).toBeTrue();

        viewQueryParam$.next(ViewMode.DetailedListElement);
        fixture.detectChanges();
        expect(isSelectorShown()).toBeFalse();

        viewQueryParam$.next(ViewMode.GridElement);
        fixture.detectChanges();
        expect(isSelectorShown()).toBeTrue();
      });
    });
  });
});
