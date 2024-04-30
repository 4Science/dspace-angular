import { AdvancedTopSection, TopSectionTemplateType } from '../../../core/layout/models/section.model';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderBrowseElementsComponent } from './slider-browse-elements.component';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { APP_CONFIG } from '../../../../config/app-config.interface';
import { SearchService } from '../../../core/shared/search/search.service';
import { Router } from '@angular/router';
import { RouterStub } from '../../testing/router.stub';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { createSuccessfulRemoteDataObject, createSuccessfulRemoteDataObject$ } from '../../remote-data.utils';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { of } from 'rxjs';
import { BitstreamFormat } from '../../../core/shared/bitstream-format.model';
import { buildPaginatedList } from '../../../core/data/paginated-list.model';
import { PageInfo } from '../../../core/shared/page-info.model';
import { ItemSearchResult } from '../../object-collection/shared/item-search-result.model';
import { Item } from '../../../core/shared/item.model';
import { By } from '@angular/platform-browser';
import { VarDirective } from '../../utils/var.directive';

describe('CardsBrowseElementsComponent', () => {
  let component: SliderBrowseElementsComponent;
  let fixture: ComponentFixture<SliderBrowseElementsComponent>;
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
      'dc.description.abstract': [
        {
          language: null,
          value: 'Article'
        }
      ],
    },
    firstMetadataValue: () => 'This is just another title'
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

  const topAdvancedSection: AdvancedTopSection = {
    discoveryConfigurationName: ['project', 'publication', 'author'],
    sortField: 'ASC',
    order: 'ASC',
     style: '',
    componentType: 'advanced-top-component',
    numberOfItems: 8,
    template: TopSectionTemplateType.SLIDER,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderBrowseElementsComponent, VarDirective],
      providers: [
        { provide: APP_CONFIG, useValue: mockConfig },
        { provide: SearchService, useValue: mockSearchService },
        { provide: ChangeDetectorRef, useValue: {} },
        { provide: Router, useValue: new RouterStub() },
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderBrowseElementsComponent);
    component = fixture.componentInstance;
    component.advancedTopSection = topAdvancedSection;
    component.searchResults = mockResponse;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a card', () => {
    const cards = fixture.debugElement.queryAll(By.css('.card'));
    expect(cards.length).toBe(1);
  });

  it('should render the title', () => {
    const title = fixture.debugElement.query(By.css('h4')).nativeElement.textContent;
    expect(title).toBe(mockResultObject.indexableObject.metadata['dc.title'][0].value);
  });

  it('should render the description', () => {
    const description = fixture.debugElement.query(By.css('p')).nativeElement.textContent;
    expect(description).toBeTruthy();
  });
});
