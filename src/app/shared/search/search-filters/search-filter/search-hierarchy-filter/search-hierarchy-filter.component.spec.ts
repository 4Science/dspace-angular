import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  DebugElement,
  EventEmitter,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  of as observableOf,
} from 'rxjs';

import { environment } from '../../../../../../environments/environment.test';
import { RemoteDataBuildService } from '@dspace/core';
import { APP_CONFIG } from '@dspace/core';
import { buildPaginatedList } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { RequestEntryState } from '@dspace/core';
import { PageInfo } from '@dspace/core';
import { SearchFilterConfig } from '@dspace/core';
import { SearchService } from '@dspace/core';
import { SearchFilterService } from '@dspace/core';
import { VocabularyEntryDetail } from '@dspace/core';
import { VocabularyService } from '@dspace/core';
import { RouterStub } from '@dspace/core';
import { SearchConfigurationServiceStub } from '@dspace/core';
import { SearchServiceStub } from '@dspace/core';
import { SEARCH_CONFIG_SERVICE } from '../../../../../my-dspace-page/my-dspace-configuration.service';
import { SearchHierarchyFilterComponent } from './search-hierarchy-filter.component';

describe('SearchHierarchyFilterComponent', () => {
  let comp: SearchHierarchyFilterComponent;
  let fixture: ComponentFixture<SearchHierarchyFilterComponent>;
  let showVocabularyTreeLink: DebugElement;

  const testSearchFilter = 'subject';
  const VocabularyTreeViewComponent = {
    select: new EventEmitter<VocabularyEntryDetail>(),
  };

  let searchService: SearchServiceStub;
  const searchFilterService = {
    getPage: () => observableOf(0),
  };
  let searchConfigService: SearchConfigurationServiceStub;
  let router: RouterStub;
  const modalService = jasmine.createSpyObj('modal', {
    open: {
      componentInstance: VocabularyTreeViewComponent,
      result: Promise.resolve(Object.assign(new VocabularyEntryDetail(), {
        value: 'new-selected-value',
      })),
    },
  });
  const vocabularyService = {
    searchTopEntries: () => undefined,
  };

  beforeEach(() => {
    searchService = new SearchServiceStub();
    searchConfigService = new SearchConfigurationServiceStub();
    router = new RouterStub();

    return TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgbModule,
        TranslateModule.forRoot(),
        SearchHierarchyFilterComponent,
      ],
      providers: [
        { provide: SearchService, useValue: searchService },
        { provide: SearchFilterService, useValue: searchFilterService },
        { provide: RemoteDataBuildService, useValue: {} },
        { provide: Router, useValue: router },
        { provide: NgbModal, useValue: modalService },
        { provide: VocabularyService, useValue: vocabularyService },
        { provide: APP_CONFIG, useValue: environment },
        { provide: SEARCH_CONFIG_SERVICE, useValue: searchConfigService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  function init() {
    fixture = TestBed.createComponent(SearchHierarchyFilterComponent);
    comp = fixture.componentInstance;
    comp.inPlaceSearch = false;
    comp.filterConfig = Object.assign(new SearchFilterConfig(), { name: testSearchFilter });
    comp.refreshFilters = new BehaviorSubject<boolean>(false);
    fixture.detectChanges();
    showVocabularyTreeLink = fixture.debugElement.query(By.css(`a#show-${testSearchFilter}-tree`));
  }

  describe('if the vocabulary doesn\'t exist', () => {

    beforeEach(() => {
      spyOn(vocabularyService, 'searchTopEntries').and.returnValue(observableOf(new RemoteData(
        undefined, 0, 0, RequestEntryState.Error, undefined, undefined, 404,
      )));
      init();
    });

    it('should not show the vocabulary tree link', () => {
      expect(showVocabularyTreeLink).toBeNull();
    });
  });

  describe('if the vocabulary exists', () => {

    beforeEach(() => {
      spyOn(vocabularyService, 'searchTopEntries').and.returnValue(observableOf(new RemoteData(
        undefined, 0, 0, RequestEntryState.Success, undefined, buildPaginatedList(new PageInfo(), []), 200,
      )));
      init();
    });

    it('should show the vocabulary tree link', () => {
      expect(showVocabularyTreeLink).toBeTruthy();
    });

    describe('when clicking the vocabulary tree link', () => {
      beforeEach(async () => {
        spyOn(searchConfigService, 'selectNewAppliedFilterParams').and.returnValue(observableOf({
          'f.subject': [
            'definedBy_selectNewAppliedFilterParams',
          ],
        }));
        showVocabularyTreeLink.nativeElement.click();
      });

      it('should open the vocabulary tree modal', () => {
        expect(modalService.open).toHaveBeenCalled();
      });

      describe('when selecting a value from the vocabulary tree', () => {

        it('should add a new search filter to the existing search filters', fakeAsync(() => {
          expect(modalService.open).toHaveBeenCalled();
          tick();
          expect(searchConfigService.selectNewAppliedFilterParams).toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/search'], {
            queryParams: {
              [`f.${testSearchFilter}`]: [
                'definedBy_selectNewAppliedFilterParams',
              ],
            },
          });
        }));
      });
    });
  });
});
