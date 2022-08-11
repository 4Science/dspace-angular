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
import { CarouselSectionComponent } from './carousel-section.component';
import { SearchResult } from '../../../search/models/search-result.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { createSuccessfulRemoteDataObject, createSuccessfulRemoteDataObject$ } from '../../../remote-data.utils';
import { ObjectCacheService } from '../../../../core/cache/object-cache.service';
import { UUIDService } from '../../../../core/shared/uuid.service';
import { RemoteDataBuildService } from '../../../../core/cache/builders/remote-data-build.service';
import { HALEndpointService } from '../../../../core/shared/hal-endpoint.service';
import { Store } from '@ngrx/store';
import { NotificationsServiceStub } from '../../../testing/notifications-service.stub';
import { NotificationsService } from '../../../notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { DSOChangeAnalyzer } from '../../../../core/data/dso-change-analyzer.service';
import { DefaultChangeAnalyzer } from '../../../../core/data/default-change-analyzer.service';
import { cold } from 'jasmine-marbles';

describe('CarouselSectionComponent', () => {
    let component: CarouselSectionComponent;
    let fixture: ComponentFixture<CarouselSectionComponent>;

    let searchServiceStub: any;
    let notificationService: NotificationsServiceStub;

    const searchResult = Object.assign(new SearchResult(), {
        indexableObject: Object.assign(new DSpaceObject(), {
            id: 'd317835d-7b06-4219-91e2-1191900cb897',
            uuid: 'd317835d-7b06-4219-91e2-1191900cb897',
            name: 'My first person',
            metadata: {
                'dc.title': [
                    { value: 'Test' }
                ],
                'dc.description.abstract': [
                    { value: 'Lorem Ipsum' }
                ]
            },
            _links: {
              content: { href: 'file-selflink' }
            }
        })
    });

    const searchResultRD = createSuccessfulRemoteDataObject({ page: [searchResult] });

    beforeEach(waitForAsync(() => {
        searchServiceStub = jasmine.createSpyObj('SearchService', {
            search: jasmine.createSpy('search'),
            getSearchLink: jasmine.createSpy('getSearchLink')
        });

        notificationService = new NotificationsServiceStub();
        TestBed.configureTestingModule({
            imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, BrowserModule, RouterTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useClass: TranslateLoaderMock
                    }
                }),
            ],
            declarations: [CarouselSectionComponent],
            providers: [
                CarouselSectionComponent,
                { provide: SearchService, useValue: searchServiceStub },
                { provide: ObjectCacheService, useValue: {} },
                { provide: UUIDService, useValue: {} },
                { provide: Store, useValue: {} },
                { provide: RemoteDataBuildService, useValue: {} },
                { provide: HALEndpointService, useValue: {} },
                { provide: NotificationsService, useValue: notificationService },
                { provide: HttpClient, useValue: {} },
                { provide: DSOChangeAnalyzer, useValue: {} },
                { provide: DefaultChangeAnalyzer, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselSectionComponent);
        component = fixture.componentInstance;
        searchServiceStub.search.and.returnValue(createSuccessfulRemoteDataObject$({ page: [searchResult] }));
        searchServiceStub.getSearchLink.and.returnValue('/search');
        component.sectionId = 'persons';
        component.carouselSection = {
            discoveryConfigurationName: 'person',
            style: 'col-md-12',
            title: 'dc.title',
            order: 'dc.title',
            sortField: 'asc',
            numberOfItems: 1,
            link: '',
            description: 'dc.description.abstract',
            componentType: 'carousel',
            targetBlank: true,
            fitWidth: false,
            fitHeight: false,
            keepAspectRatio: false,
            aspectRatio: undefined,
            carouselHeightPx: undefined,
            captionStyle: undefined,
            titleStyle: undefined,
          };

        fixture.detectChanges();
    });

    it('should create CarouselSectionComponent', inject([CarouselSectionComponent], (comp: CarouselSectionComponent) => {
        expect(comp).toBeDefined();
    }));

    it('should init search results data properly', (done) => {
        const expected = cold('(a|)', { a: searchResultRD });
        expect(component.searchResults$).toBeObservable(expected);
        done();
    });

});
