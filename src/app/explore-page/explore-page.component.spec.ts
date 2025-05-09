import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  inject,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  BrowserModule,
  By,
} from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import {
  Observable,
  of,
} from 'rxjs';

import { RemoteData } from '../core/data/remote-data';
import {
  BrowseSection,
  FacetSection,
  SearchSection,
  Section,
  TopSection,
  TopSectionTemplateType,
} from '../core/layout/models/section.model';
import { SectionDataService } from '../core/layout/section-data.service';
import { ThemedBrowseSectionComponent } from '../shared/explore/section-component/browse-section/themed-browse-section.component';
import { ThemedCountersSectionComponent } from '../shared/explore/section-component/counters-section/themed-counters-section.component';
import { ThemedFacetSectionComponent } from '../shared/explore/section-component/facet-section/themed-facet-section.component';
import { ThemedSearchSectionComponent } from '../shared/explore/section-component/search-section/themed-search-section.component';
import { ThemedTextSectionComponent } from '../shared/explore/section-component/text-section/themed-text-section.component';
import { ThemedTopSectionComponent } from '../shared/explore/section-component/top-section/themed-top-section.component';
import { TranslateLoaderMock } from '../shared/mocks/translate-loader.mock';
import { createSuccessfulRemoteDataObject$ } from '../shared/remote-data.utils';
import { ExplorePageComponent } from './explore-page.component';

describe('ExploreComponent', () => {
  let component: ExplorePageComponent;
  let fixture: ComponentFixture<ExplorePageComponent>;

  let sectionDataServiceStub: any;
  let route: any;

  const browseComponent: BrowseSection = {
    browseNames: ['rodept', 'author', 'title', 'type'],
    componentType: 'browse',
    style: 'col-md-4',
  };

  const topComponent: TopSection = {
    discoveryConfigurationName: 'publication',
    componentType: 'top',
    style: 'col-md-6',
    order: 'desc',
    sortField: 'dc.date.accessioned',
    numberOfItems: 5,
    titleKey: 'lastPublications',
    showThumbnails: false,
    template: TopSectionTemplateType.DEFAULT,
  };

  const searchComponent: SearchSection = {
    discoveryConfigurationName: 'publication',
    componentType: 'search',
    style: 'col-md-8',
    searchType: 'advanced',
    initialStatements: 3,
    displayTitle: true,
  };

  const facetComponent: FacetSection = {
    discoveryConfigurationName: 'publication',
    componentType: 'facet',
    style: 'col-md-12',
    facetsPerRow: 4,
  };

  beforeEach(waitForAsync(() => {

    sectionDataServiceStub = {
      findById(id: string): Observable<RemoteData<Section>> {
        if (id === 'publications') {
          const section = new Section();
          section.id = 'publications';
          section.componentRows = [[browseComponent, searchComponent], [topComponent], [facetComponent]];
          return createSuccessfulRemoteDataObject$(section);
        } else {
          return of(null);
        }
      },
    };

    route = {
      params: of({ id: 'publications' }),
    };

    TestBed.configureTestingModule({
      imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, ExplorePageComponent, BrowserModule, RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
      ],
      providers: [ExplorePageComponent,
        { provide: SectionDataService, useValue: sectionDataServiceStub },
        { provide: ActivatedRoute, useValue: route }],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ExplorePageComponent, { remove: { imports: [ThemedTopSectionComponent, ThemedBrowseSectionComponent, ThemedSearchSectionComponent, ThemedFacetSectionComponent, ThemedTextSectionComponent, ThemedCountersSectionComponent] } }).compileComponents();

  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ExploreComponent', inject([ExplorePageComponent], (comp: ExplorePageComponent) => {
    expect(comp).toBeDefined();
  }));

  it('should place the sections on three rows', () => {
    const container = fixture.debugElement.query(By.css('.container'));
    expect(container.children.length).toEqual(3);

    const firstRow = container.children[0];
    expect(firstRow.children.length).toEqual(2);
    expect(firstRow.children[0].children[0].name).toEqual('ds-browse-section');
    expect(firstRow.children[1].children[0].name).toEqual('ds-search-section');

    const secondRow = container.children[1];
    expect(secondRow.children.length).toEqual(1);
    expect(secondRow.children[0].children[0].name).toEqual('ds-top-section');

    const thirdRow = container.children[2];
    expect(thirdRow.children.length).toEqual(1);
    expect(thirdRow.children[0].children[0].name).toEqual('ds-facet-section');

    expect(component.sectionId).toEqual('publications');
  });

});
