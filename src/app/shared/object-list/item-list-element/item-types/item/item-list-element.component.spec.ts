import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of as observableOf } from 'rxjs';

import { DSONameService } from '../../../../../core/breadcrumbs/dso-name.service';
import { Item } from '../../../../../core/shared/item.model';
import { DSONameServiceMock } from '../../../../mocks/dso-name.service.mock';
import { TruncatableService } from '../../../../truncatable/truncatable.service';
import { TruncatePipe } from '../../../../utils/truncate.pipe';
import { ItemListElementComponent } from './item-list-element.component';

const mockItem: Item = Object.assign(new Item(), {
  bundles: observableOf({}),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
    'dc.contributor.author': [
      {
        language: 'en_US',
        value: 'Smith, Donald',
      },
    ],
    'dc.publisher': [
      {
        language: 'en_US',
        value: 'a publisher',
      },
    ],
    'dc.date.issued': [
      {
        language: 'en_US',
        value: '2015-06-26',
      },
    ],
    'dc.description.abstract': [
      {
        language: 'en_US',
        value: 'This is the abstract',
      },
    ],
  },
});

describe('ItemListElementComponent', () => {
  let comp;
  let fixture;

  const truncatableServiceStub: any = {
    isCollapsed: (id: number) => observableOf(true),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ItemListElementComponent, TruncatePipe],
      providers: [
        { provide: DSONameService, useValue: new DSONameServiceMock() },
        { provide: TruncatableService, useValue: truncatableServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemListElementComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemListElementComponent);
    comp = fixture.componentInstance;
  }));

  describe(`when the publication is rendered`, () => {
    beforeEach(() => {
      comp.object = mockItem;
      fixture.detectChanges();
    });

    it(`should contain a PublicationListElementComponent`, () => {
      const publicationListElement = fixture.debugElement.query(By.css(`ds-item-search-result-list-element`));
      expect(publicationListElement).not.toBeNull();
    });
  });
});
