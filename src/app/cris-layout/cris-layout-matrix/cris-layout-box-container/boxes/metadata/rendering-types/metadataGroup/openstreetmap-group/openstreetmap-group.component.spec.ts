import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenstreetmapGroupComponent } from './openstreetmap-group.component';
import { Item } from '../../../../../../../../core/shared/item.model';
import { of } from 'rxjs';
import { LayoutField } from '../../../../../../../../core/layout/models/box.model';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../../../../../../shared/mocks/translate-loader.mock';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadMoreService } from '../../../../../../../services/load-more.service';
import { OpenStreetMapComponent } from '../../../../../../../../shared/open-street-map/open-street-map.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LocationPlace, LocationService } from '../../../../../../../../core/services/location.service';

describe('OpenstreetmapGroupComponent', () => {
  let component: OpenstreetmapGroupComponent;

  let fixture: ComponentFixture<OpenstreetmapGroupComponent>;

  const locationService = jasmine.createSpyObj('locationService', {
    searchPlace: jasmine.createSpy('searchPlace'),
    searchCoordinates: jasmine.createSpy('searchCoordinates'),
    isValidCoordinateString: jasmine.createSpy('isValidCoordinateString'),
    parseCoordinates: jasmine.createSpy('parseCoordinates'),
    isCoordinateString: jasmine.createSpy('isCoordinateString'),
  });

  const place: LocationPlace = {
    coordinates: {
      latitude: 52.520008,
      longitude: 13.404954,
    },
    displayName: '10178 Berlin, Germania'
  };

  const testItem = Object.assign(new Item(), {
    bundles: of({}),
    metadata: {
      'dc.coverage.spatialgpdpy': [
        {
          value: '45.4899793'
        },
      ],
      'dc.coverage.spatialgpdpx': [
        {
          value: '9.138292'
        },
      ]
    }
  });

  const mockField = Object.assign({
    id: 1,
    fieldType: 'METADATAGROUP',
    metadata: 'dc.coverage.spatialgpdpy',
    label: 'Coordinates',
    rendering: 'googlemaps-group',
    style: 'container row',
    styleLabel: 'font-weight-bold col-4',
    styleValue: 'col',
    metadataGroup: {
      leading: 'dc.coverage.spatialgpdpy',
      elements: [
        {
          metadata: 'dc.coverage.spatialgpdpy',
          label: 'Latitude',
          rendering: 'TEXT',
          fieldType: 'METADATA',
          style: null,
          styleLabel: 'font-weight-bold col-0',
          styleValue: 'col'
        },
        {
          metadata: 'dc.coverage.spatialgpdpx',
          label: 'Longitude',
          rendering: 'TEXT',
          fieldType: 'METADATA',
          style: null,
          styleLabel: 'font-weight-bold col-0',
          styleValue: 'col'
        }
      ]
    }
  }) as LayoutField;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }), BrowserAnimationsModule],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: 'tabNameProvider', useValue: '' },
        { provide: LocationService, useValue: locationService },
        LoadMoreService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [
        OpenstreetmapGroupComponent,
        OpenStreetMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenstreetmapGroupComponent);
    component = fixture.componentInstance;
    locationService.isCoordinateString.and.returnValue(true);
    locationService.isValidCoordinateString.and.returnValue(true);
    locationService.parseCoordinates.and.returnValue(place.coordinates);
    locationService.searchCoordinates.and.returnValue(of(place.displayName));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate coordinates', () => {
    expect(component.coordinates).not.toBeUndefined();
    const latitude = testItem.metadata['dc.coverage.spatialgpdpy'][0].value;
    const longitude = testItem.metadata['dc.coverage.spatialgpdpx'][0].value;
    expect(component.coordinates).toBe(`${latitude},${longitude}`);
  });
});
