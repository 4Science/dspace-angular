import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError, map, take } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';

export interface LocationCoordinates {
  latitude: number,
  longitude: number,
}

export interface LocationPlace {
  coordinates?: LocationCoordinates,
  displayName?: string,
}

export enum LocationErrorCodes {
  // define a `location.error.*` i18n label for each error code
  INVALID_COORDINATES = 'invalid-coordinates',
  LOCATION_NOT_FOUND = 'location-not-found',
  API_ERROR = 'api-error',
}

const IS_COORDINATE_PAIR_REGEXP = /^\d+\.?\d*,\d+\.?\d*$/;

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
   * Search a place (address or POI) with Nominatim, and return the coordinates and the display name of the most relevant search result
   * @param address the place to be searched
   * @returns {LocationPlace} the information related to the searched place
   */
  public searchPlace(address: string): Observable<LocationPlace> {
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
          const coordinates: LocationCoordinates = {
            latitude: parseFloat(firstMatch.lat),
            longitude: parseFloat(firstMatch.lon),
          };
          const info: LocationPlace = {
            coordinates: coordinates,
            displayName: firstMatch.display_name,
          };
          return info;
        } else {
          console.warn('Location service', `Location "${address}" not found`);
          throw Error(LocationErrorCodes.LOCATION_NOT_FOUND);
        }
      }),
    );
  }

  /**
   * Search coordinates with Nominatim and return the display name
   * @param coordinates
   * @returns {Observable<string>} the display name for the coordinates
   */
  public searchCoordinates(coordinates: LocationCoordinates): Observable<string> {
    let params = new HttpParams()
      .append('lat', coordinates.latitude)
      .append('lon', coordinates.longitude)
      .append('format', NOMINATIM_RESPONSE_FORMAT);

    return this.http.get<Record<string,any>>(this.reverseSearchEndpoint, { params: params }).pipe(
      catchError((err) => {
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
  public isValidCoordinatePair(latitude: number, longitude: number): boolean {
    return !(isNaN(latitude) || isNaN(longitude) || latitude > 90 || latitude < -90 || longitude > 180 || longitude < -180);
  }

  /**
   * Check if a string is in the format `latitude,longitude`
   * @param coordinateString the string to be checked
   * @returns {boolean} whether the string has a valid format
   */
  public isCoordinateString(coordinateString: string): boolean {
    return IS_COORDINATE_PAIR_REGEXP.test(coordinateString) && coordinateString.split(',').length === 2;
  }

  /**
   * Check if a string contains valid coordinateString in the format `latitude,longitude`
   * @param coordinateString the string to be checked
   * @returns {boolean} whether the string is valid and it contains valid coordinateString
   */
  public isValidCoordinateString(coordinateString: string): boolean {
    if (this.isCoordinateString(coordinateString)) {
      const coordinateArray = coordinateString.split(',');
      const latitude = parseFloat(coordinateArray[0]);
      const longitude = parseFloat(coordinateArray[1]);
      return !isNaN(latitude) && !isNaN(longitude) && this.isValidCoordinatePair(latitude, longitude);
    } else {
      return false;
    }
  }

  /**
   * Parse a string containing location coordinates, and return an object containing latitude and longitude as numbers
   * @param coordinates a string in the format `latitude,longitude`
   * @returns {LocationCoordinates} the parsed coordinates
   */
  public parseCoordinates(coordinates: string): LocationCoordinates {
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
