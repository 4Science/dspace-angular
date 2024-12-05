import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map, take } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';

/**
 * Geographic coordinates in Decimal Degree notation
 */
export interface LocationDDCoordinates {
  latitude: number | string,
  longitude: number | string,
}

export interface LocationPlace {
  coordinates?: LocationDDCoordinates,
  displayName?: string,
}

export enum LocationErrorCodes {
  // define a `location.error.*` i18n label for each error code
  INVALID_COORDINATES = 'invalid-coordinates',
  LOCATION_NOT_FOUND = 'location-not-found',
  API_ERROR = 'api-error',
}

const IS_DD_COORDINATE_PAIR_REGEXP = /^\d+\.?\d*,\d+\.?\d*$/;
const IS_SG_COORDINATE_PAIR_REGEXP = /^[NS] *\d+° *\d+['′] *\d+(?:"|″|\.\d+),? *[EW] *\d+° *\d+['′] *\d+(?:"|″|\.\d+)|\d+° *\d+['′] *\d+(?:"|″|\.\d+) *[NS],? *\d+° *\d+['′] *\d+(?:"|″|\.\d+) *[EW]$/;

const NOMINATIM_RESPONSE_FORMAT = 'jsonv2';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  searchEndpoint = environment.location.nominatimApi.searchEndpoint;
  reverseSearchEndpoint = environment.location.nominatimApi.reverseSearchEndpoint;

  constructor(
    protected http: HttpClient,
  ) { }

  /**
   * Search Nominatim for a place (address or POI), then find the coordinates and the display name of the most relevant search result
   * @param address the place to be searched
   * @returns {LocationPlace} the information related to the searched place
   */
  public findPlaceCoordinates(address: string): Observable<LocationPlace> {
    let params = new HttpParams().append('q', address).append('format', NOMINATIM_RESPONSE_FORMAT);

    return this.http.get<Record<string,any>[]>(this.searchEndpoint, { params: params }).pipe(
      catchError((err) => {
        console.error('Location service', err);
        throw Error(LocationErrorCodes.API_ERROR);
      }),
      take(1),
      map((searchResults) => {
        if (searchResults.length > 1) {
          console.warn('Location service', `Multiple locations found for address "${address}"`, 'Showing top matches', searchResults.slice(0,5));
        }
        if (searchResults.length > 0) {
          const firstMatch = searchResults[0];
          const coordinates: LocationDDCoordinates = {
            latitude: parseFloat(firstMatch.lat),
            longitude: parseFloat(firstMatch.lon),
          };
          const place: LocationPlace = {
            coordinates: coordinates,
            displayName: firstMatch.display_name,
          };
          return place;
        } else {
          console.warn('Location service', `Location "${address}" not found`);
          throw Error(LocationErrorCodes.LOCATION_NOT_FOUND);
        }
      }),
    );
  }

  /**
   * Search Nominatim for coordinates, then return the decimal coordinates and the display name
   * @param coordinates the coordinates, in any supported format
   * @returns {LocationPlace} the information related to the searched coordinates
   */
  public findPlaceAndDecimalCoordinates(coordinates: string): Observable<LocationPlace> {
    let params = new HttpParams().append('q', coordinates).append('format', NOMINATIM_RESPONSE_FORMAT);

    return this.http.get<Record<string,any>[]>(this.searchEndpoint, { params: params }).pipe(
      catchError((err) => {
        console.error('Location service', err);
        throw Error(LocationErrorCodes.API_ERROR);
      }),
      take(1),
      map((searchResults) => {
        if (searchResults.length > 0) {
          const firstMatch = searchResults[0];
          const decimalCoordinates: LocationDDCoordinates = {
            latitude: parseFloat(firstMatch.lat),
            longitude: parseFloat(firstMatch.lon),
          };
          const place: LocationPlace = {
            coordinates: decimalCoordinates,
            displayName: firstMatch.display_name,
          };
          return place;
        } else {
          console.warn('Location service', `Invalid coordinates ${coordinates}`);
          throw Error(LocationErrorCodes.INVALID_COORDINATES);
        }
      }),
    );
  }

  /**
   * Search Nominatim for a place by coordinates, and return the display name
   * @param coordinates
   * @returns {Observable<string>} the display name for the coordinates
   */
  public searchByCoordinates(coordinates: LocationDDCoordinates): Observable<string> {
    let params = new HttpParams()
      .append('lat', coordinates.latitude)
      .append('lon', coordinates.longitude)
      .append('format', NOMINATIM_RESPONSE_FORMAT);

    return this.http.get<Record<string,any>>(this.reverseSearchEndpoint, { params: params }).pipe(
      catchError((err) => {
        console.error('Location service', err);
        throw Error(LocationErrorCodes.API_ERROR);
      }),
      take(1),
      map((searchResults) => {
        if (hasValue(searchResults.error)) {
          throw Error(searchResults.error);
        } else {
          return searchResults.display_name;
        }
      }),
    );
  }

  /**
   * Check if the provided pair of coordinates is valid
   * @param latitude the latitude as float number
   * @param longitude the longitude as float number
   * @returns {boolean} whether the coordinates are valid
   */
  public isValidDecimalCoordinatePair(latitude: number, longitude: number): boolean {
    return !(isNaN(latitude) || isNaN(longitude) || latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180);
  }

  /**
   * Check if a string is in the format `latitude,longitude`
   * @param coordinateString the string to be checked
   * @returns {boolean} whether the string has a valid format
   */
  public isDecimalCoordinateString(coordinateString: string): boolean {
    return IS_DD_COORDINATE_PAIR_REGEXP.test(coordinateString) && coordinateString.split(',').length === 2;
  }

  /**
   * Check if a string is in the format `latitude,longitude`
   * @param coordinateString the string to be checked
   * @returns {boolean} whether the string has a valid format
   */
  public isSexagesimalCoordinateString(coordinateString: string): boolean {
    return IS_SG_COORDINATE_PAIR_REGEXP.test(coordinateString);
  }

  /**
   * Check if a string contains valid coordinateString in the format `latitude,longitude`
   * @param coordinateString the string to be checked
   * @returns {boolean} whether the string is valid and it contains valid coordinateString
   */
  public isValidCoordinateString(coordinateString: string): boolean {
    if (this.isDecimalCoordinateString(coordinateString)) {
      const coordinateArray = coordinateString.split(',');
      const latitude = parseFloat(coordinateArray[0]);
      const longitude = parseFloat(coordinateArray[1]);
      return !isNaN(latitude) && !isNaN(longitude) && this.isValidDecimalCoordinatePair(latitude, longitude);
    } else {
      return false;
    }
  }

  /**
   * Parse a string containing location coordinates, and return an object containing latitude and longitude as numbers
   * @param coordinates a string in the format `latitude,longitude`
   * @returns {LocationDDCoordinates} the parsed coordinates
   */
  public parseCoordinates(coordinates: string): LocationDDCoordinates {
    const coordinateArr = coordinates.split(',');
    if (this.isValidCoordinateString(coordinates)) {
      const latitude = parseFloat(coordinateArr[0]);
      const longitude = parseFloat(coordinateArr[1]);
      return { latitude, longitude };
    } else {
      console.warn('Location service', `Invalid coordinates "${coordinates}"`);
      throw Error(LocationErrorCodes.INVALID_COORDINATES);
    }
  }
}
