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
import { JournalSearchResultGridElementComponent } from '../search-result-grid-elements/journal/journal-search-result-grid-element.component';
import { JournalGridElementComponent } from './journal-grid-element.component';

const mockItem = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
    'creativework.editor': [
      {
        language: 'en_US',
        value: 'Smith, Donald',
      },
    ],
    'creativework.publisher': [
      {
        language: 'en_US',
        value: 'A company',
      },
    ],
    'dc.description': [
      {
        language: 'en_US',
        value: 'This is the description',
      },
    ],
  },
});

describe('JournalGridElementComponent', () => {
  let comp;
  let fixture;

  const truncatableServiceStub: any = {
    isCollapsed: (id: number) => observableOf(true),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TruncatePipe, JournalGridElementComponent],
      providers: [
        { provide: DSONameService, useValue: new DSONameServiceMock() },
        { provide: TruncatableService, useValue: truncatableServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(JournalGridElementComponent, {
      remove: {
        imports: [JournalSearchResultGridElementComponent],
      },
      add: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(JournalGridElementComponent);
    comp = fixture.componentInstance;
  }));

  describe(`when the journal is rendered`, () => {
    beforeEach(() => {
      comp.object = mockItem;
      fixture.detectChanges();
    });

    it(`should contain a JournalGridElementComponent`, () => {
      const journalGridElement = fixture.debugElement.query(By.css(`ds-journal-search-result-grid-element`));
      expect(journalGridElement).not.toBeNull();
    });
  });
});
