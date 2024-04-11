import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CarouselWithThumbnailsComponent } from './carousel-with-thumbnails.component';
import { RemoteDataBuildService } from '../../../core/cache/builders/remote-data-build.service';
import { ActivatedRoute } from '@angular/router';
import { of as observableOf, of } from 'rxjs';
import { HALEndpointService } from '../../../core/shared/hal-endpoint.service';
import { RouterMock } from '../../mocks/router.mock';
import { DSOChangeAnalyzer } from '../../../core/data/dso-change-analyzer.service';
import { BitstreamFormatDataService } from '../../../core/data/bitstream-format-data.service';
import { NativeWindowService } from '../../../core/services/window.service';
import { CarouselOptions } from '../carousel-options.model';
import { Item } from '../../../core/shared/item.model';
import { MetadataMap, MetadataValue } from '../../../core/shared/metadata.models';
import { PageInfo } from '../../../core/shared/page-info.model';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../mocks/translate-loader.mock';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { BitstreamImagesService } from '../../../core/data/bitstream-images.service';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { SearchManager } from '../../../core/browse/search-manager';
import { RouteService } from '../../../core/services/route.service';
import { RequestService } from '../../../core/data/request.service';

describe('CarouselWithThumbnailsComponent', () => {
  let component: CarouselWithThumbnailsComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<CarouselWithThumbnailsComponent>;
  let routerMock: RouterMock = new RouterMock();
  let halService = jasmine.createSpyObj('halService', {
    getEndpoint: observableOf('fake-url')
  });
  let searchConfigStub = {
    getConfigurationSearchConfig: jasmine.createSpy('getConfigurationSearchConfig').and.returnValue(of({}))
  };

  let remoteDataBuildServiceStub = jasmine.createSpyObj('RemoteDataBuildService', {
    buildSingle: observableOf({}),
    buildList: observableOf({}),
    buildFromHref: observableOf({})
  });

  let item = Object.assign(new Item(), {
    uuid: 'e1c51c69-896d-42dc-8221-1d5f2ad5516e', metadata: {
      'dc.title': [{ value: 'title', } as MetadataValue]
    } as MetadataMap
  } as Item);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
      ],
      declarations: [CarouselWithThumbnailsComponent],
      providers: [
        { provide: RemoteDataBuildService, useValue: remoteDataBuildServiceStub },
        {
          provide: ActivatedRoute, useValue: {
            queryParamMap: observableOf({})
          }
        },
        { provide: HALEndpointService, useValue: halService },
        { provide: DSOChangeAnalyzer, useValue: {} },
        { provide: BitstreamFormatDataService, useValue: {} },
        { provide: NativeWindowService, useValue: {} },
        { provide: SearchConfigurationService, useValue: searchConfigStub },
        { provide: BitstreamDataService, useValue: {} },
        { provide: BitstreamImagesService, useValue: {} },
        { provide: SearchManager, useValue: {} },
        { provide: RouteService, useValue: {} },
        { provide: RequestService, useValue: jasmine.createSpyObj('requestService', ['generateRequestId', 'send']) },
        ChangeDetectorRef,
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselWithThumbnailsComponent);
    component = fixture.componentInstance;
    componentAsAny = component;
    component.carouselOptions = { title: 'title', link: 'title' } as CarouselOptions;
    component.itemList = [Object.assign(new Item(), item)];
    routerMock.parseUrl.and.returnValue({ root: { children: { primary: { segments: ['1'] } } } });
    component.pageInfo = new PageInfo({
      elementsPerPage: 1,
      totalElements: 2,
      totalPages: 1,
      currentPage: 1
    });
    component.scope = 's154-125df-125df';
    component.discoveryConfiguration = 'test';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize entries on ngOnInit', () => {
    spyOn(component, 'initializeEntries');
    component.ngOnInit();
    expect(component.initializeEntries).toHaveBeenCalled();
  });

  it('should determine if an element is in view', () => {
    const element = document.createElement('div');
    spyOn(element, 'getBoundingClientRect').and.returnValue({
      top: 5,
      bottom: 15,
      height: 500,
      width: 500,
      x: 0,
      y: 0,
      right: 10,
      left: 0,
      toJSON: () => {
        /** empty section */
      }
    });
    spyOn(component.thumbnailContainer.nativeElement, 'getBoundingClientRect').and.returnValue({
      top: 0,
      bottom: 10
    });
    expect(componentAsAny.isElementInView(element)).toBe(false);
  });

  it('should check if first item', () => {
    component.activeItemIndex = 0;
    expect(component.isFirstItem).toBe(true);
    component.activeItemIndex = 1;
    expect(component.isFirstItem).toBe(false);
  });

  it('should check if last item', () => {
    component.activeItemIndex = 0;
    expect(component.isLastItem).toBe(false);
    component.activeItemIndex = 1;
    expect(component.isLastItem).toBe(true);
  });

  it('should set active item', () => {
    component.carousel = jasmine.createSpyObj('NgbCarousel', ['select', 'pause']);
    component.itemToImageHrefMap$.next(new Map([[item.uuid, 'fake-url']]));

    component.setActiveItem(0);
    expect(component.carousel.select).toHaveBeenCalledWith('ngb-slide-0');
    expect(component.carousel.pause).toHaveBeenCalled();

  });

  it('should get next item', () => {
    spyOn(component, 'setActiveItem');
    component.activeItemIndex = 0;
    component.getNext();
    expect(component.setActiveItem).toHaveBeenCalledWith(1);
  });

  it('should get previous item', () => {
    spyOn(component, 'setActiveItem');
    component.activeItemIndex = 1;
    component.getPrev();
    expect(component.setActiveItem).toHaveBeenCalledWith(0);
  });

  it('should check if link is internal', () => {
    expect(component.isLinkInternal('/internal/link')).toBe(true);
    expect(component.isLinkInternal('http://external.link')).toBe(false);
  });
});
