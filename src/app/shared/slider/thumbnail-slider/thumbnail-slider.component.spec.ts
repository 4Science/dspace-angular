import { ChangeDetectorRef } from '@angular/core';
/* tslint:disable:no-unused-variable */
import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { BitstreamImagesService } from 'src/app/core/services/bitstream-images.service';
import { RouteService } from 'src/app/core/services/route.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from 'src/app/core/services/window.service';
import { Item } from 'src/app/core/shared/item.model';

import { SearchManager } from './../../../core/browse/search-manager';
import { RemoteDataBuildService } from './../../../core/cache/builders/remote-data-build.service';
import { RequestService } from './../../../core/data/request.service';
import { HALEndpointService } from './../../../core/shared/hal-endpoint.service';
import { SearchConfigurationService } from './../../../core/shared/search/search-configuration.service';
import { ThumbnailSliderComponent } from './thumbnail-slider.component';

describe('ThumbnailSliderComponent', () => {
  let component: ThumbnailSliderComponent;
  let componentAsAny: any;
  let fixture: ComponentFixture<ThumbnailSliderComponent>;

  let halService = jasmine.createSpyObj('halService', {
    getEndpoint: of('fake-url'),
  });

  let remoteDataBuildServiceStub = jasmine.createSpyObj('RemoteDataBuildService', {
    buildSingle: of({}),
    buildList: of({}),
    buildFromHref: of({}),
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThumbnailSliderComponent],
      providers: [
        { provide: BitstreamDataService, useValue: {} },
        { provide: BitstreamImagesService, useValue: {} },
        { provide: ChangeDetectorRef, useValue: {} },
        { provide: SearchManager, useValue: {} },
        { provide: NativeWindowService, useValue: {} },
        { provide: NativeWindowRef, useValue: {} },
        { provide: SearchConfigurationService, useValue: { getConfigurationSearchConfig: () => of({ sortOptions: [] }) } },
        {
          provide: ActivatedRoute, useValue: {
            queryParamMap: of({}),
          },
        },
        { provide: RouteService, useValue: {} },
        { provide: HALEndpointService, useValue: halService },
        { provide: RequestService, useValue: jasmine.createSpyObj('requestService', ['generateRequestId', 'send']) },
        { provide: RemoteDataBuildService, useValue: remoteDataBuildServiceStub },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailSliderComponent);
    component = fixture.componentInstance;
    componentAsAny = component;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onThumbnailSelected event when onThumbnailClick is called', () => {
    const item = new Item();
    const index = 1;
    spyOn(component.thumbnailSelected, 'emit');
    component.onThumbnailClick(item, index);
    expect(component.thumbnailSelected.emit).toHaveBeenCalledWith(item);
  });

  it('should set activeIndex when onThumbnailClick is called', () => {
    const item = new Item();
    const index = 1;
    component.onThumbnailClick(item, index);
    expect(component.activeIndex).toBe(index);
  });

  it('should set activeIndex when setActiveIndex is called', () => {
    const index = 1;
    componentAsAny.setActiveIndex(index);
    expect(component.activeIndex).toBe(index);
  });

  it('should emit activeIndexChange event when setActiveIndex is called', () => {
    const index = 1;
    spyOn(component.activeIndexChange, 'emit');
    componentAsAny.setActiveIndex(index);
    expect(component.activeIndexChange.emit).toHaveBeenCalledWith(index);
  });

  it('should call nextPage when checkAndGetNextPage is called and activeIndex is a multiple of numberOfItems', () => {
    component.activeIndex = component.numberOfItems - 1;
    spyOn(component, 'nextPage');
    componentAsAny.checkAndGetNextPage();
    expect(component.nextPage).toHaveBeenCalled();
  });

  it('should call scrollIntoThumbnails when checkAndGetNextPage is called', () => {
    spyOn(component, 'scrollIntoThumbnails');
    componentAsAny.checkAndGetNextPage();
    expect(component.scrollIntoThumbnails).toHaveBeenCalled();
  });

  it('should increment activeIndex when getNext is called', () => {
    const initialIndex = component.activeIndex;
    component.getNext();
    expect(component.activeIndex).toBe(initialIndex + 1);
  });

  it('should decrement activeIndex when getPrev is called', () => {
    component.activeIndex = 1;
    const initialIndex = component.activeIndex;
    component.getPrev();
    expect(component.activeIndex).toBe(initialIndex - 1);
  });
});
