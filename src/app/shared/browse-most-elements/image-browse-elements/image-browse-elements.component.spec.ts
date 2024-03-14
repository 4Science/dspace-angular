import { BitstreamFormat } from './../../../core/shared/bitstream-format.model';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { Item } from '../../../core/shared/item.model';
import { PageInfo } from './../../../core/shared/page-info.model';
import { buildPaginatedList } from './../../../core/data/paginated-list.model';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';

import { ImageBrowseElementsComponent } from './image-browse-elements.component';
import { createSuccessfulRemoteDataObject, createSuccessfulRemoteDataObject$ } from '../../remote-data.utils';
import { of } from 'rxjs';
import { APP_CONFIG } from '../../../../config/app-config.interface';
import { SearchService } from '../../../core/shared/search/search.service';
import { Router } from '@angular/router';
import { RouterStub } from '../../testing/router.stub';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { ItemSearchResult } from '../../object-collection/shared/item-search-result.model';

describe('ImageBrowseElementsComponent', () => {
  let component: ImageBrowseElementsComponent;
  let fixture: ComponentFixture<ImageBrowseElementsComponent>;
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

  const mockBitstreamDataService = {
    findAllByItemAndBundleName: jasmine.createSpy('findAllByItemAndBundleName').and.returnValue(of(createSuccessfulRemoteDataObject$([
      Object.assign(new Bitstream(), {
        format: of(createSuccessfulRemoteDataObject$(Object.assign(new BitstreamFormat(), {
          mimetype: 'image/png'
        }))),
        _links: {
          content: {
            href: 'test.png'
          }
        }
      })
    ])))
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageBrowseElementsComponent ],
      providers: [
        { provide: APP_CONFIG, useValue: mockConfig },
        { provide: SearchService, useValue: mockSearchService },
        { provide: ChangeDetectorRef, useValue: {} },
        { provide: Router, useValue: new RouterStub() },
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageBrowseElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get all bitstreams for items', () => {
    component.ngOnInit();
    expect(mockBitstreamDataService.findAllByItemAndBundleName).toHaveBeenCalled();
  });
});
