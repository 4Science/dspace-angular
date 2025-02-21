import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of as observableOf } from 'rxjs';

import { DSONameService } from '@dspace/core';
import { buildPaginatedList } from '@dspace/core';
import { Item } from '@dspace/core';
import { PageInfo } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { DSONameServiceMock } from '../../../../shared/mocks/dso-name.service.mock';
import { TruncatableService } from '../../../../shared/truncatable/truncatable.service';
import { TruncatePipe } from '../../../../shared/utils/truncate.pipe';
import { JournalIssueSearchResultGridElementComponent } from '../search-result-grid-elements/journal-issue/journal-issue-search-result-grid-element.component';
import { JournalIssueGridElementComponent } from './journal-issue-grid-element.component';



const mockItem = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
    'creativework.datePublished': [
      {
        language: null,
        value: '2015-06-26',
      },
    ],
    'journal.title': [
      {
        language: 'en_US',
        value: 'The journal title',
      },
    ],
  },
});

describe('JournalIssueGridElementComponent', () => {
  let comp;
  let fixture;

  const truncatableServiceStub: any = {
    isCollapsed: (id: number) => observableOf(true),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TruncatePipe, JournalIssueGridElementComponent],
      providers: [
        { provide: DSONameService, useValue: new DSONameServiceMock() },
        { provide: TruncatableService, useValue: truncatableServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(JournalIssueGridElementComponent, {
      add: { changeDetection: ChangeDetectionStrategy.Default },
      remove: {
        imports: [JournalIssueSearchResultGridElementComponent],
      },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(JournalIssueGridElementComponent);
    comp = fixture.componentInstance;
  }));

  describe(`when the journal issue is rendered`, () => {
    beforeEach(() => {
      comp.object = mockItem;
      fixture.detectChanges();
    });

    it(`should contain a JournalIssueSearchResultGridElementComponent`, () => {
      const journalIssueGridElement = fixture.debugElement.query(By.css(`ds-journal-issue-search-result-grid-element`));
      expect(journalIssueGridElement).not.toBeNull();
    });
  });
});
