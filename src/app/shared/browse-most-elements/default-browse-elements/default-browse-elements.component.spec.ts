import { ItemSearchResult } from './../../object-collection/shared/item-search-result.model';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { DefaultBrowseElementsComponent } from './default-browse-elements.component';
import { createSuccessfulRemoteDataObject } from '../../remote-data.utils';
import { buildPaginatedList } from '../../../core/data/paginated-list.model';
import { PageInfo } from '../../../core/shared/page-info.model';
import { of } from 'rxjs';
import { Item } from '../../../core/shared/item.model';
import { APP_CONFIG } from '../../../../config/app-config.interface';
import { SearchService } from '../../../core/shared/search/search.service';
import { Router } from '@angular/router';
import { RouterStub } from '../../testing/router.stub';
import { PaginationComponentOptions } from '../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import { SortDirection, SortOptions } from '../../../core/cache/models/sort-options.model';
import { followLink } from '../../utils/follow-link-config.model';

describe('DefaultBrowseElementsComponent', () => {
  let component: DefaultBrowseElementsComponent;
  let fixture: ComponentFixture<DefaultBrowseElementsComponent>;

  const mockResultObject: ItemSearchResult = new ItemSearchResult();
  mockResultObject.hitHighlights = {};

  mockResultObject.indexableObject = Object.assign(new Item(), {
    bundles: of({}),
    metadata: {
      'dc.title': [
        {
          language: 'en_US',
          value: 'This is just another title'
        }
      ],
      'dc.type': [
        {
          language: null,
          value: 'Article'
        }
      ],
      'dc.contributor.author': [
        {
          language: 'en_US',
          value: 'Smith, Donald'
        }
      ],
      'dc.date.issued': [
        {
          language: null,
          value: '2015-06-26'
        }
      ]
    }
  });
  const mockResponse = createSuccessfulRemoteDataObject(buildPaginatedList(new PageInfo(), [mockResultObject]));

  const mockSearchService = {
    search: jasmine.createSpy('search').and.returnValue(of(mockResponse)),
  };

  const mockConfig = {
    browseBy: {
      showThumbnails: true
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultBrowseElementsComponent ],
      providers: [
        { provide: APP_CONFIG, useValue: mockConfig },
        { provide: SearchService, useValue: mockSearchService },
        { provide: ChangeDetectorRef, useValue: {} },
        { provide: Router, useValue: new RouterStub() },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultBrowseElementsComponent);
    component = fixture.componentInstance;
    component.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: 'test',
      pagination: Object.assign(new PaginationComponentOptions(), {
        id: 'search-object-pagination',
        pageSize: 5,
        currentPage: 1
      }),
      sort: new SortOptions('dc.title', SortDirection.ASC)
    });
    fixture.detectChanges();
  });


  it('should create', () => {
    component.showThumbnails = true;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call searchService.search on ngOnInit with followLinks', () => {
    component.showThumbnails = true;
    component.ngOnChanges();
    fixture.detectChanges();

    expect(mockSearchService.search).toHaveBeenCalledWith(
      component.paginatedSearchOptions,
      null,
      true,
      true,
      followLink('thumbnail')
    );
  });
});
