import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { SearchService } from '../../../../core/shared/search/search.service';
import { TranslateLoaderMock } from '../../../mocks/translate-loader.mock';
import { GridSectionComponent } from './grid-section.component';
import { SearchResult } from '../../../search/models/search-result.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { createSuccessfulRemoteDataObject$ } from '../../../remote-data.utils';
import { LocaleService } from '../../../../core/locale/locale.service';
import { Site } from '../../../../core/shared/site.model';
import { of } from 'rxjs';
import { SortDirection } from '../../../../core/cache/models/sort-options.model';

describe('GridSectionComponent', () => {
  let component: GridSectionComponent;
  let fixture: ComponentFixture<GridSectionComponent>;

  let searchServiceStub: any;

  const languageList = ['en;q=1', 'it;q=0.9', 'de;q=0.8', 'fr;q=0.7'];

  const mockLocaleService = jasmine.createSpyObj('LocaleService', {
    getCurrentLanguageCode: jasmine.createSpy('getCurrentLanguageCode'),
    getLanguageCodeList: of(languageList)
  });

  const firstSearchResult = Object.assign(new SearchResult(), {
    _embedded: {
      indexableObject: Object.assign(new DSpaceObject(), {
        id: 'd317835d-7b06-4219-91e2-1191900cb897',
        uuid: 'd317835d-7b06-4219-91e2-1191900cb897',
        name: 'My first publication',
        metadata: {
          'dspace.entity.type': [
            { value: 'Publication' }
          ]
        },
        firstMetadataValue(keyOrKeys: string | string[]): string {
          return '';
        },
      })
    }
  });

  const secondSearchResult = Object.assign(new SearchResult(), {
    _embedded: {
      indexableObject: Object.assign(new DSpaceObject(), {
        id: '0c34d491-b5ed-4a78-8b29-83d0bad80e5a',
        uuid: '0c34d491-b5ed-4a78-8b29-83d0bad80e5a',
        name: 'This is a publication',
        firstMetadataValue(keyOrKeys: string | string[]): string {
          return '';
        },
      })
    }
  });

  beforeEach(waitForAsync(() => {
    searchServiceStub = jasmine.createSpyObj('SearchService', {
      search: jasmine.createSpy('search'),
      getSearchLink: jasmine.createSpy('getSearchLink')
    });

    TestBed.configureTestingModule({
      imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, BrowserModule, RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
      ],
      declarations: [GridSectionComponent],
      providers: [GridSectionComponent,
        { provide: SearchService, useValue: searchServiceStub },
        { provide: LocaleService, useValue: mockLocaleService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridSectionComponent);
    component = fixture.componentInstance;
    searchServiceStub.search.and.returnValue(createSuccessfulRemoteDataObject$({ page: [firstSearchResult, secondSearchResult] }));
    searchServiceStub.getSearchLink.and.returnValue('/search');
    component.sectionId = 'publications';
    component.gridSection = {
      discoveryConfigurationName: 'publication',
      componentType: 'grid',
      style: 'col-md-6',
      mainContentLink: '',
      order: SortDirection.ASC,
      sortField: ''
    };
    component.site  = Object.assign(new Site(), {
      id: 'test-site',
      _links: {
        self: { href: 'test-site-href' }
      },
      metadata: {
        'cms.homepage.footer': [
          {
            language: 'en',
            value: '1234'
          }
        ],
        'dc.description': [
          {
            language: 'en_US',
            value: 'desc'
          }
        ]
      }
    });

    fixture.detectChanges();
  });

  it('should create GridSectionComponent', inject([GridSectionComponent], (comp: GridSectionComponent) => {
    expect(comp).toBeDefined();
  }));

});
