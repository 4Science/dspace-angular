import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CarouselRelationsComponent } from './carousel-relations.component';
import { SearchService } from '../../core/shared/search/search.service';
import { getMockSearchService } from '../../shared/mocks/search-service.mock';
import { ObjectCacheService } from '../../core/cache/object-cache.service';
import { getMockObjectCacheService } from '../../shared/mocks/object-cache.service.mock';
import { UUIDService } from '../../core/shared/uuid.service';
import { getMockUUIDService } from '../../shared/mocks/uuid.service.mock';
import { ItemDataService } from '../../core/data/item-data.service';
import { BrowseService } from '../../core/browse/browse.service';
import { SidebarService } from '../../shared/sidebar/sidebar.service';
import { HostWindowService } from '../../shared/host-window.service';
import { ActivatedRoute, Router } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterMock } from '../../shared/mocks/router.mock';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { RemoteDataBuildService } from '../../core/cache/builders/remote-data-build.service';
import { HostWindowServiceStub } from '../../shared/testing/host-window-service.stub';
import { of as observableOf } from 'rxjs';
import { environment } from '../../../environments/environment';
import { APP_CONFIG } from '../../../config/app-config.interface';

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
            queryParamMap: observableOf({})
          }
        },
        { provide: Router, useValue: routerMock },
        { provide: SidebarService, useValue: {} },
        { provide: HALEndpointService, useValue: {} },
        { provide: APP_CONFIG, useValue: environment },
        provideMockStore({ core: { auth: { loading: false } } } as any)
      ]
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
