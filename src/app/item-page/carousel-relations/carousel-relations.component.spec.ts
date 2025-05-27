import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of as observableOf } from 'rxjs';

import { APP_CONFIG } from '../../../config/app-config.interface';
import { environment } from '../../../environments/environment';
import { BrowseService } from '../../core/browse/browse.service';
import { RemoteDataBuildService } from '../../core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../core/cache/object-cache.service';
import { ItemDataService } from '../../core/data/item-data.service';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { SearchService } from '../../core/shared/search/search.service';
import { UUIDService } from '../../core/shared/uuid.service';
import { HostWindowService } from '../../shared/host-window.service';
import { getMockObjectCacheService } from '../../shared/mocks/object-cache.service.mock';
import { RouterMock } from '../../shared/mocks/router.mock';
import { getMockSearchService } from '../../shared/mocks/search-service.mock';
import { getMockUUIDService } from '../../shared/mocks/uuid.service.mock';
import { SidebarService } from '../../shared/sidebar/sidebar.service';
import { HostWindowServiceStub } from '../../shared/testing/host-window-service.stub';
import { CarouselRelationsComponent } from './carousel-relations.component';

describe('CarouselRelationsComponent', () => {
  let component: CarouselRelationsComponent;
  let fixture: ComponentFixture<CarouselRelationsComponent>;
  let routerMock: RouterMock = new RouterMock();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CarouselRelationsComponent],
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
            queryParamMap: observableOf({}),
          },
        },
        { provide: Router, useValue: routerMock },
        { provide: SidebarService, useValue: {} },
        { provide: HALEndpointService, useValue: {} },
        { provide: APP_CONFIG, useValue: environment },
        provideMockStore({ core: { auth: { loading: false } } } as any),
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselRelationsComponent);
    component = fixture.componentInstance;
    routerMock.parseUrl.and.returnValue({ root: { children: { primary: { segments: ['1'] } } } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
