import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';

import { buildPaginatedList } from '../../core/data/paginated-list.model';
import { Item } from '../../core/shared/item.model';
import { PageInfo } from '../../core/shared/page-info.model';
import { GeospatialMapDetail } from '../geospatial-map/models/geospatial-map-detail.model';
import { TranslateLoaderMock } from '../mocks/translate-loader.mock';
import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';
import { PaginationComponent } from '../pagination/pagination.component';
import { createSuccessfulRemoteDataObject$ } from '../remote-data.utils';
import { ObjectGeospatialMapComponent } from './object-geospatial-map.component';

describe('ObjectGeospatialMapComponent', () => {

  // Expected geospatial map info parsed in component from search results
  const expected = new GeospatialMapDetail();
  expected.points = [{ longitude: 104, latitude: -12, url: '/items', title: 'Test item title' }];
  expected.title = 'Test item title';
  expected.route = '/items';

  // Mock search results
  const mockItemWithMetadata: ItemSearchResult = new ItemSearchResult();
  mockItemWithMetadata.hitHighlights = {};
  mockItemWithMetadata.indexableObject = Object.assign(new Item(), {
    bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
    metadata: {
      'dc.title': [
        {
          language: 'en_US',
          value: 'Test item title',
        },
      ],
      'dcterms.spatial': [
        {
          language: null,
          value: 'Point ( +104.000000 -012.000000 )',
        },
      ],
    },
  });
  const testObjects = [mockItemWithMetadata];
  const mockRD = {
    payload: {
      page: testObjects,
    },
  } as any;

  let component: ObjectGeospatialMapComponent;
  let fixture: ComponentFixture<ObjectGeospatialMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ObjectGeospatialMapComponent, StoreModule.forRoot(), TranslateModule.forRoot({
        loader: {
          useClass: TranslateLoaderMock,
          provide: TranslateLoader,
        },
      })],
      providers: [TranslateService, TranslateStore, TranslateLoader, TranslateLoaderMock],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ObjectGeospatialMapComponent, {
      remove: {
        imports: [PaginationComponent],
      },
      add: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  });

  it('component is created successfully', () => {
    component.objects = mockRD;
    expect(component).toBeTruthy();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectGeospatialMapComponent);
    component = fixture.componentInstance; // SearchPageComponent test instance
    component.objects = mockRD;
    fixture.detectChanges();
  });

  it('component parses search results into a map info array for map drawing', () => {
    expect(component.mapInfo).toEqual([expected]);
  });

  it('parses valid WKT string into GeospatialMapDetail with correct point data', () => {
    const mockItem = new Item();
    mockItem.name = 'Test Item';
    const wktString = 'POINT (30 10)';
    const result = (component as any).parseWKTMapDetail(wktString, mockItem);

    expect(result).toBeTruthy();
    expect(result.points.length).toBe(1);
    expect(result.points[0].latitude).toBe(10);
    expect(result.points[0].longitude).toBe(30);
    expect(result.points[0].title).toBe('Test Item');
  });

  it('returns null for invalid WKT string', () => {
    const mockItem = new Item();
    const invalidWKT = 'INVALID (30 10)';
    const result = (component as any).parseWKTMapDetail(invalidWKT, mockItem);

    expect(result).toBeNull();
  });

  it('parses valid coordinate string into GeospatialMapDetail with correct point data', () => {
    const mockItem = new Item();
    mockItem.name = 'Test Item';
    const coordinateString = '10, 20';
    const result = (component as any).parseCoordinatesMapDetail(coordinateString, mockItem);

    expect(result).toBeTruthy();
    expect(result.points.length).toBe(1);
    expect(result.points[0].latitude).toBe(10);
    expect(result.points[0].longitude).toBe(20);
    expect(result.points[0].title).toBe('Test Item');
  });

  it('returns null for invalid coordinate string', () => {
    const mockItem = new Item();
    const invalidCoordinates = 'invalid, data';
    const result = (component as any).parseCoordinatesMapDetail(invalidCoordinates, mockItem);

    expect(result).toBeNull();
  });

  it('parses valid latitude and longitude into GeospatialMapDetail with correct point data', () => {
    const mockItem = new Item();
    mockItem.name = 'Test Item';
    const latitude = '15';
    const longitude = '25';
    const result = (component as any).parseLatLongMapDetail(latitude, longitude, mockItem);

    expect(result).toBeTruthy();
    expect(result.points.length).toBe(1);
    expect(result.points[0].latitude).toBe(15);
    expect(result.points[0].longitude).toBe(25);
    expect(result.points[0].title).toBe('Test Item');
  });

  it('returns null for invalid latitude or longitude', () => {
    const mockItem = new Item();
    const invalidLatitude = 'invalid';
    const longitude = '25';
    const result = (component as any).parseLatLongMapDetail(invalidLatitude, longitude, mockItem);

    expect(result).toBeNull();
  });

});
