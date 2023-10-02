import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CarouselWithThumbnailsComponent } from './carousel-with-thumbnails.component';
import { SearchService } from '../../../core/shared/search/search.service';
import { getMockSearchService } from '../../mocks/search-service.mock';
import { getMockObjectCacheService } from '../../mocks/object-cache.service.mock';
import { ObjectCacheService } from '../../../core/cache/object-cache.service';
import { UUIDService } from '../../../core/shared/uuid.service';
import { getMockUUIDService } from '../../mocks/uuid.service.mock';
import { provideMockStore } from '@ngrx/store/testing';
import { RemoteDataBuildService } from '../../../core/cache/builders/remote-data-build.service';
import { ItemDataService } from '../../../core/data/item-data.service';
import { BrowseService } from '../../../core/browse/browse.service';
import { HostWindowService } from '../../host-window.service';
import { HostWindowServiceStub } from '../../testing/host-window-service.stub';
import { ActivatedRoute, Router } from '@angular/router';
import { of as observableOf } from 'rxjs';
import { SidebarService } from '../../sidebar/sidebar.service';
import { HALEndpointService } from '../../../core/shared/hal-endpoint.service';
import { RouterMock } from '../../mocks/router.mock';
import { DSOChangeAnalyzer } from '../../../core/data/dso-change-analyzer.service';
import { BitstreamFormatDataService } from '../../../core/data/bitstream-format-data.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NativeWindowService } from '../../../core/services/window.service';
import { CarouselOptions } from '../carousel-options.model';
import { Item } from '../../../core/shared/item.model';
import { ItemSearchResult } from '../../object-collection/shared/item-search-result.model';
import { MetadataMap, MetadataValue } from '../../../core/shared/metadata.models';

describe('CarouselRelationsComponent', () => {
  let component: CarouselWithThumbnailsComponent;
  let fixture: ComponentFixture<CarouselWithThumbnailsComponent>;
  let routerMock: RouterMock = new RouterMock();

  let item = Object.assign(new Item(), {
    uuid: 'e1c51c69-896d-42dc-8221-1d5f2ad5516e', metadata: {
      'dc.title': [{value: 'title', } as MetadataValue]
    } as MetadataMap
  } as Item);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CarouselWithThumbnailsComponent ],
      providers: [
        { provide: SearchService, useValue: getMockSearchService() },
        { provide: ObjectCacheService, useValue: getMockObjectCacheService() },
        { provide: UUIDService, useValue: getMockUUIDService() },
        { provide: RemoteDataBuildService, useValue: {} },
        { provide: ItemDataService, useValue: {} },
        { provide: BrowseService, useValue: {} },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(0) },
        {
          provide: ActivatedRoute, useValue: {
            queryParamMap: observableOf({})
          }
        },
        { provide: Router, useValue: routerMock },
        { provide: SidebarService, useValue: {} },
        { provide: HALEndpointService, useValue: {} },
        { provide: DSOChangeAnalyzer, useValue: {} },
        { provide: BitstreamFormatDataService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: NativeWindowService, useValue: {} },
        provideMockStore({ core: { auth: { loading: false } } } as any)
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselWithThumbnailsComponent);
    component = fixture.componentInstance;
    component.carouselOptions = {title: 'title', link: 'title'} as CarouselOptions;
    component.items = [Object.assign(new ItemSearchResult(), { indexableObject: item })];
    routerMock.parseUrl.and.returnValue({ root: { children: { primary: { segments: ['1'] } } } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
