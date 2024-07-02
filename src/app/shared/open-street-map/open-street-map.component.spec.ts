import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenStreetMapComponent } from './open-street-map.component';
import { TranslateModule } from '@ngx-translate/core';
import { LocationErrorCodes, LocationPlace, LocationService } from '../../core/services/location.service';
import { of, throwError } from 'rxjs';

describe('OpenStreetMapComponent', () => {
  let component: OpenStreetMapComponent;
  let fixture: ComponentFixture<OpenStreetMapComponent>;

  const locationService = jasmine.createSpyObj('locationService', {
    searchPlace: jasmine.createSpy('searchPlace'),
    searchCoordinates: jasmine.createSpy('searchCoordinates'),
    isValidCoordinateString: jasmine.createSpy('isValidCoordinateString'),
    parseCoordinates: jasmine.createSpy('parseCoordinates'),
    isCoordinateString: jasmine.createSpy('isCoordinateString'),
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
      locationService.isCoordinateString.and.returnValue(true);
      locationService.isValidCoordinateString.and.returnValue(true);
      locationService.parseCoordinates.and.returnValue(place.coordinates);
    });

    describe('and they are found', () => {
      beforeEach(() => {
        locationService.searchCoordinates.and.returnValue(of(place.displayName));
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

        locationService.searchCoordinates.and.callFake(() => {
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
      locationService.isCoordinateString.and.returnValue(false);
    });

    describe('and exists', () => {
      beforeEach(() => {
        locationService.searchPlace.and.returnValue(of(placeOnlyCoordinates));
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

        locationService.searchPlace.and.callFake(() => {
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
