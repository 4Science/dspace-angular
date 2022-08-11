import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TranslateLoaderMock } from '../mocks/translate-loader.mock';
import { CarouselComponent } from './carousel.component';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { createSuccessfulRemoteDataObject$ } from '../remote-data.utils';
import { ObjectCacheService } from '../../core/cache/object-cache.service';
import { UUIDService } from '../../core/shared/uuid.service';
import { RemoteDataBuildService } from '../../core/cache/builders/remote-data-build.service';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { Store } from '@ngrx/store';
import { NotificationsServiceStub } from '../testing/notifications-service.stub';
import { NotificationsService } from '../notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { DSOChangeAnalyzer } from '../../core/data/dso-change-analyzer.service';
import { DefaultChangeAnalyzer } from '../../core/data/default-change-analyzer.service';
import { Item } from '../../core/shared/item.model';
import { Observable } from 'rxjs';
import { RemoteData } from '../../core/data/remote-data';
import { Bitstream } from '../../core/shared/bitstream.model';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { FindListOptions } from '../../core/data/request.models';
import { FollowLinkConfig } from '../utils/follow-link-config.model';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { createPaginatedList } from '../testing/utils.test';
import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';
import { BitstreamFormat } from '../../core/shared/bitstream-format.model';
import { CarouselOptions } from './carousel-options.model';

describe('CarouselComponent', () => {
    let component: CarouselComponent;
    let fixture: ComponentFixture<CarouselComponent>;

    let notificationService: NotificationsServiceStub;

    const mockBitstreamDataService = jasmine.createSpyObj('bitstreamDataService', {
        getThumbnailFor(item: Item): Observable<RemoteData<Bitstream>> {
            return createSuccessfulRemoteDataObject$(new Bitstream());
        },
        findAllByItemAndBundleName(item: Item, bundleName: string, options?: FindListOptions, ...linksToFollow: FollowLinkConfig<Bitstream>[]): Observable<RemoteData<PaginatedList<Bitstream>>> {
            return createSuccessfulRemoteDataObject$(createPaginatedList([mockBitstream1]));
        },
    });

    const carouselOptions: CarouselOptions = {
      title: 'dc.title',
      link: '',
      description: 'dc.description',
      fitWidth: false,
      fitHeight: true,
      targetBlank: true,
      keepAspectRatio: false,
      carouselHeightPx: 50,
      aspectRatio: 1,
      captionStyle: '',
      titleStyle: ''
    };

    const firstItemResult = Object.assign(new ItemSearchResult(), {
        indexableObject: Object.assign(new DSpaceObject(), {
            id: 'd317835d-7b06-4219-91e2-1191900cb897',
            uuid: 'd317835d-7b06-4219-91e2-1191900cb897',
            name: 'My first person',
            metadata: {
                'dc.title': [
                    { value: 'Test' }
                ],
                'dc.description': [
                    { value: 'Lorem Ipsum' }
                ]
            },
            _links: {
              content: { href: 'file-selflink' }
            }
        })
    });

    const secondItemResult = Object.assign(new ItemSearchResult(), {
        indexableObject: Object.assign(new DSpaceObject(), {
            id: 'd317835d-7b06-4219-91e2-1191900cb897',
            uuid: 'd317835d-7b06-4219-91e2-1191900cb897',
            name: 'My first person',
            metadata: {},
            _links: {
              content: { href: 'file-selflink' }
            }
        })
    });

    const mockBitstream1: Bitstream = Object.assign(new Bitstream(),
    {
      sizeBytes: 10201,
      bundleName: 'ORIGINAL',
      _links: {
        self: {
          href: 'https://dspace7.4science.it/dspace-spring-rest/api/core/bitstreams/cf9b0c8e-a1eb-4b65-afd0-567366448713'
        },
        content: {
          href: 'https://dspace7.4science.it/dspace-spring-rest/api/core/bitstreams/cf9b0c8e-a1eb-4b65-afd0-567366448713/content'
        }
      },
      id: 'cf9b0c8e-a1eb-4b65-afd0-567366448713',
      uuid: 'cf9b0c8e-a1eb-4b65-afd0-567366448713',
      type: 'bitstream',
      metadata: {
        'dc.title': [
          {
            value: 'test_word.jpg'
          }
        ]
      },
      format: createSuccessfulRemoteDataObject$(Object.assign(new BitstreamFormat(),
      {
        mimetype: 'image/jpeg'
      }))
    });

    const mockBitstream2: Bitstream = Object.assign(new Bitstream(),
    {
      sizeBytes: 10201,
      bundleName: 'ORIGINAL',
      _links: {
        self: {
          href: 'testURL'
        },
        content: {
          href: 'testURL'
        }
      },
      id: 'cf9b0c8e-a1eb-4b65-afd0-567366448713',
      uuid: 'cf9b0c8e-a1eb-4b65-afd0-567366448713',
      type: 'bitstream',
      metadata: {
        'dc.title': [
          {
            value: 'test_word.docx'
          }
        ]
      },
      format: createSuccessfulRemoteDataObject$(Object.assign(new BitstreamFormat(),
      {
        mimetype: 'application/pdf'
      }))
    });

    beforeEach(waitForAsync(() => {
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
            declarations: [CarouselComponent],
            providers: [
                CarouselComponent,
                { provide: ObjectCacheService, useValue: {} },
                { provide: UUIDService, useValue: {} },
                { provide: Store, useValue: {} },
                { provide: RemoteDataBuildService, useValue: {} },
                { provide: HALEndpointService, useValue: {} },
                { provide: NotificationsService, useValue: notificationService },
                { provide: HttpClient, useValue: {} },
                { provide: DSOChangeAnalyzer, useValue: {} },
                { provide: DefaultChangeAnalyzer, useValue: {} },
                { provide: BitstreamDataService, useValue: mockBitstreamDataService },
                { provide: NativeWindowService, useValue: new NativeWindowRef() },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselComponent);
        component = fixture.componentInstance;
        mockBitstreamDataService.findAllByItemAndBundleName.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([mockBitstream1])));
        component.items = [firstItemResult];
        component.carouselOptions = carouselOptions;

        fixture.detectChanges();
    });

    it('should create CarouselComponent', inject([CarouselComponent], (comp: CarouselComponent) => {
        expect(comp).toBeDefined();
    }));


    it('should render title', (done) => {
        const title = fixture.debugElement.queryAll(By.css('[data-test="carouselObjTitle"]'));
        expect(title.length).toBe(1);
        done();
    });

    it('should render description', (done) => {
        const desc = fixture.debugElement.queryAll(By.css('[data-test="carouselObjDesc"]'));
        expect(desc.length).toBe(1);
        done();
    });

    it('should render image', (done) => {
        const image = fixture.debugElement.queryAll(By.css('.picsum-img-wrapper'));
        expect(image.length).toBe(1);
        done();
    });

    describe('when no data', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CarouselComponent);
            component = fixture.componentInstance;
            mockBitstreamDataService.findAllByItemAndBundleName.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([mockBitstream2])));
            component.items = [secondItemResult];
            component.carouselOptions = carouselOptions;

            fixture.detectChanges();
        });

        it('should not render title', (done) => {
            const title = fixture.debugElement.queryAll(By.css('#carouselObjTitle'));
            expect(title.length).toBe(0);
            done();
        });

        it('should not render description', (done) => {
            const desc = fixture.debugElement.queryAll(By.css('#carouselObjDesc'));
            expect(desc.length).toBe(0);
            done();
        });

        it('should not render image', (done) => {
            const image = fixture.debugElement.queryAll(By.css('.picsum-img-wrapper'));
            expect(image.length).toBe(0);
            done();
        });
    });

});
