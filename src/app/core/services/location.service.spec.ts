import { TestBed } from '@angular/core/testing';

import { LocationService } from './location.service';
import { HttpClient } from '@angular/common/http';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: {} },
      ],
    });
    service = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test utility methods', () => {
    it('isCoordinateString() should validate coordinate strings correctly', () => {
      expect(service.isCoordinateString(null)).toBeFalse();             // invalid pattern
      expect(service.isCoordinateString(undefined)).toBeFalse();        // invalid pattern
      expect(service.isCoordinateString('qwerty')).toBeFalse();         // invalid pattern
      expect(service.isCoordinateString('45')).toBeFalse();             // invalid pattern, wrong array size
      expect(service.isCoordinateString('45,')).toBeFalse();            // invalid pattern, wrong array size
      expect(service.isCoordinateString(',45')).toBeFalse();            // invalid pattern, wrong array size
      expect(service.isCoordinateString('45,45')).toBeTrue();
      expect(service.isCoordinateString('45,45,')).toBeFalse();         // invalid pattern, wrong array size
      expect(service.isCoordinateString('45,45,45')).toBeFalse();       // invalid pattern, wrong array size
      expect(service.isCoordinateString('.0,.0')).toBeFalse();          // valid numbers, but invalid pattern
      expect(service.isCoordinateString('45.000,45.000')).toBeTrue();
      expect(service.isCoordinateString('45.000, 45.000')).toBeFalse(); // it contains a space
      expect(service.isCoordinateString('200,200')).toBeTrue();         // invalid numbers, but valid pattern
    });

    it('isValidCoordinateString() should validate coordinate strings and check for their values correctly', () => {
      expect(service.isValidCoordinateString('45,45')).toBeTrue();
      expect(service.isValidCoordinateString('200,200')).toBeFalse();    // valid pattern, invalid numbers
    });

    it('should validate coordinate pairs correctly', () => {
      expect(service.isValidCoordinatePair(0, 0)).toBeTrue();
      expect(service.isValidCoordinatePair(45, 45)).toBeTrue();
      expect(service.isValidCoordinatePair(-45, -45)).toBeTrue();
      expect(service.isValidCoordinatePair(200, 0)).toBeFalse();
      expect(service.isValidCoordinatePair(0, 200)).toBeFalse();
      expect(service.isValidCoordinatePair(-200, 0)).toBeFalse();
      expect(service.isValidCoordinatePair(0, -200)).toBeFalse();
      expect(service.isValidCoordinatePair(NaN, 0)).toBeFalse();
      expect(service.isValidCoordinatePair(0, NaN)).toBeFalse();
    });
  });
});
