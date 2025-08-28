import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';

import { APP_CONFIG } from '../../../config/app-config.interface';
import { environment } from '../../../environments/environment';
import { Item } from '../../core/shared/item.model';
import {
  MetadataMap,
  MetadataValue,
} from '../../core/shared/metadata.models';
import { CarouselOptions } from '../carousel/carousel-options.model';
import { HostWindowService } from '../host-window.service';
import { RouterMock } from '../mocks/router.mock';
import { TranslateLoaderMock } from '../mocks/translate-loader.mock';
import { ThumbnailSliderComponent } from '../slider/thumbnail-slider/thumbnail-slider.component';
import { CarouselWithThumbnailsComponent } from './carousel-with-thumbnails.component';

describe('CarouselWithThumbnailsComponent', () => {
  let component: CarouselWithThumbnailsComponent;
  let fixture: ComponentFixture<CarouselWithThumbnailsComponent>;
  let routerMock: RouterMock = new RouterMock();

  let itemMock = Object.assign(new Item(), {
    uuid: 'e1c51c69-896d-42dc-8221-1d5f2ad5516e', metadata: {
      'dc.title': [{ value: 'title' } as MetadataValue],
    } as MetadataMap,
  } as Item);

  let hostWindowServicve = jasmine.createSpyObj('HostWindowService', [
    'isXs',
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        CarouselWithThumbnailsComponent,
        MockComponent(ThumbnailSliderComponent),
      ],
      declarations: [CarouselWithThumbnailsComponent],
      providers: [
        { provide: HostWindowService, useValue: hostWindowServicve },
        {
          provide: APP_CONFIG,
          useValue: environment,
        },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselWithThumbnailsComponent);
    component = fixture.componentInstance;
    component.carouselOptions = { title: 'dc.title', link: 'title' } as CarouselOptions;
    component.itemList = [Object.assign(new Item(), itemMock)];
    routerMock.parseUrl.and.returnValue({ root: { children: { primary: { segments: ['1'] } } } });
    hostWindowServicve.isXs.and.returnValue(of(false));
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


  it('should set active item', () => {
    component.carousel = jasmine.createSpyObj('NgbCarousel', ['select', 'pause']);
    component.itemToImageHrefMap$.next(new Map([[itemMock.uuid, 'fake-url']]));

    component.setActiveItem(0);
    expect(component.carousel.select).toHaveBeenCalledWith('ngb-slide-0');
    expect(component.carousel.pause).toHaveBeenCalled();

  });

  it('should set active item on slide', () => {
    component.itemList = [new Item(), new Item(), new Item()];
    component.onSlide({ current: 'ngb-slide-1' } as any);
    expect(component.activeItem).toEqual(component.itemList[1]);
  });

  it('should check if link is internal', () => {
    expect(component.isLinkInternal('/internal/link')).toBeTrue();
    expect(component.isLinkInternal('http://external.link')).toBeFalse();
  });

  it('should get item link', () => {
    const item = new Item();
    item.uuid = 'item-uuid';
    expect(component.getItemLink(item)).toBe('/items/item-uuid');
  });

  it('should get selected thumbnail to show on carousel', () => {
    const item = new Item();
    component.selectedThumbnail(item);
    expect(component.activeItem).toBe(item);
  });

  it('should get item map value', () => {
    const map = new Map<string, string>();
    component.getItemMapValue(map);
    expect(component.itemToImageHrefMap$.value).toBe(map);
  });

  it('should get updated item list', () => {
    const items = [new Item(), new Item(), new Item()];
    component.getUpdatedItemList(items);
    expect(component.itemList).toBe(items);
    expect(component.activeItem).toBe(items[0]);
  });
});
