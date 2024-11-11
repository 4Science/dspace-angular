import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { createSuccessfulRemoteDataObject$ } from '../remote-data.utils';
import { GooglemapsComponent } from './googlemaps.component';
import { LocationService } from '../../core/services/location.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GooglemapsComponent', () => {

  let component: GooglemapsComponent;
  let fixture: ComponentFixture<GooglemapsComponent>;

  const coordinates = '@41.3455,456.67';

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: jasmine.createSpy('findByPropertyName')
  });

  const confResponse$ = createSuccessfulRemoteDataObject$({ values: ['valid-googlemap-key'] });

  const locationService = jasmine.createSpyObj('locationService', {
    findPlaceCoordinates: jasmine.createSpy('findPlaceCoordinates'),
    findPlaceAndDecimalCoordinates: jasmine.createSpy('findPlaceAndDecimalCoordinates'),
    searchByCoordinates: jasmine.createSpy('searchByCoordinates'),
    isValidDecimalCoordinatePair: jasmine.createSpy('isValidDecimalCoordinatePair'),
    isDecimalCoordinateString: jasmine.createSpy('isDecimalCoordinateString'),
    isSexagesimalCoordinateString: jasmine.createSpy('isSexagesimalCoordinateString'),
    isValidCoordinateString: jasmine.createSpy('isValidCoordinateString'),
    parseCoordinates: jasmine.createSpy('parseCoordinates'),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      declarations: [ GooglemapsComponent ],
      providers: [
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: LocationService, useValue: locationService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    component.coordinates = coordinates;
    configurationDataService.findByPropertyName.and.returnValues(confResponse$);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render google map.',() => {
    const container = fixture.debugElement.query(By.css('.map-container'));
    expect(container).toBeTruthy();
  });

  it('should not render google map if coordinates are not valid.',() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    component.coordinates = '';
    const container = fixture.debugElement.query(By.css('.map-container'));
    expect(container).toBeFalsy();
  });

  it('should not render google map if the google maps api key is not present.',() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    component.coordinates = coordinates;
    component.noKeyConfigured = true;
    const container = fixture.debugElement.query(By.css('.map-container'));
    expect(container).toBeFalsy();
  });
});
