import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenStreetMapComponent } from './open-street-map.component';
import { TranslateModule } from '@ngx-translate/core';
import { LocationErrorCodes, LocationPlace, LocationService } from '../../core/services/location.service';
import { of, throwError } from 'rxjs';

describe('OpenStreetMapComponent', () => {
  let component: OpenStreetMapComponent;
  let fixture: ComponentFixture<OpenStreetMapComponent>;

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

  const coordinates = '52.520008,13.404954';
  const address = '10178 Berlin, Germania';
  const place: LocationPlace = {
    coordinates: {
      latitude: 52.520008,
      longitude: 13.404954,
    },
    displayName: '10178 Berlin, Germania'
  };

  const errPlace: LocationPlace = {
    coordinates: {
      latitude: 52.520008,
      longitude: 13.404954,
    }
  };

  const placeOnlyCoordinates: LocationPlace = {
    coordinates: {
      latitude: 52.520008,
      longitude: 13.404954,
    },
  };
  const placeWithAddress: LocationPlace = {
    displayName: '10178 Berlin, Germania'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpenStreetMapComponent],
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: LocationService, useValue: locationService },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenStreetMapComponent);
    component = fixture.componentInstance;

  });

  describe('when coordinates are given', () => {
    beforeEach(() => {
      component.coordinates = coordinates;
      locationService.isDecimalCoordinateString.and.returnValue(true);
      locationService.isValidCoordinateString.and.returnValue(true);
      locationService.parseCoordinates.and.returnValue(place.coordinates);
    });

    describe('and they are found', () => {
      beforeEach(() => {
        locationService.searchByCoordinates.and.returnValue(of(place.displayName));
        fixture.detectChanges();
      });

      it('should create the component', () => {
        expect(component).toBeTruthy();
      });

      it('should init the place object', () => {
        expect(component.place.value).toEqual(place);
      });
    });

    describe('and they are not found', () => {
      beforeEach(() => {

        locationService.searchByCoordinates.and.callFake(() => {
          return throwError(() => new Error('Fake error'));
        });
        fixture.detectChanges();
      });

      it('should create the component', () => {
        expect(component).toBeTruthy();
      });

      it('should init the place object', () => {
        expect(component.place.value).toEqual(errPlace);
      });
    });
  });

  describe('when address is given', () => {
    beforeEach(() => {
      component.coordinates = address;
      locationService.isDecimalCoordinateString.and.returnValue(false);
    });

    describe('and exists', () => {
      beforeEach(() => {
        locationService.findPlaceCoordinates.and.returnValue(of(placeOnlyCoordinates));
        locationService.findPlaceAndDecimalCoordinates.and.returnValue(of(place));
        fixture.detectChanges();
      });

      it('should create the component', () => {
        expect(component).toBeTruthy();
      });

      it('should init the place object', () => {
        expect(component.place.value).toEqual(place);
      });
    });

    describe('and is not found', () => {
      beforeEach(() => {

        locationService.findPlaceCoordinates.and.callFake(() => {
          return throwError(() => new Error(LocationErrorCodes.API_ERROR));
        });
        locationService.findPlaceAndDecimalCoordinates.and.callFake(() => {
          return throwError(() => new Error(LocationErrorCodes.API_ERROR));
        });
        fixture.detectChanges();
      });

      it('should create the component', () => {
        expect(component).toBeTruthy();
      });

      it('should init the place object', () => {
        expect(component.invalidLocationErrorCode.value).toBe(LocationErrorCodes.API_ERROR);
      });
    });
  });

});
