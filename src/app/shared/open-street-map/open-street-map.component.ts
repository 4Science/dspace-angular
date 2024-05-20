import { Component, Input, OnInit } from '@angular/core';
import {
  LocationCoordinates,
  LocationErrorCodes,
  LocationPlace,
  LocationService
} from '../../core/services/location.service';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { isNotEmpty } from '../empty.util';

export interface OpenStreetMapPointer {
  coordinates: LocationCoordinates,
  color: string,
}

@Component({
  selector: 'ds-open-street-map',
  templateUrl: './open-street-map.component.html',
  styleUrls: ['./open-street-map.component.scss'],
})
export class OpenStreetMapComponent implements OnInit {

  // Spacial reference identifier
  SRID = 'EPSG:4326'; // World Geodetic System 1984

  zoom = 14;

  /**
   * The width of the map
   */
  @Input() width?: string;

  /**
   * The height of the map
   */
  @Input() height?: string;

  /**
   * The map coordinates
   */
  @Input() coordinates: string;

  /**
   * The name of the location
   */
  @Input() displayName: string;

  /**
   * The CSS classes to be applied to the location name, which is shown below the map
   */
  @Input() displayNameClass: string;

  /**
   * Show zoom controls on the map
   */
  @Input() showControlsZoom = true;

  /**
   * The name of the location
   */
  @Input() showDisplayName = false;

  /**
   * The coordinates of the place once retrieved by the location service
   */
  coordinates$: Observable<LocationCoordinates>;

  /**
   * The name of the address to display
   */
  displayName$: Observable<string>;

  /**
   * Contains error codes from the location service
   */
  invalidLocationErrorCode: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * The place to be shown in the map
   */
  place = new BehaviorSubject<LocationPlace>(undefined);

  /**
   * The pointers to be shown on the map
   */
  pointers$: Observable<OpenStreetMapPointer[]>;

  constructor(
    protected translateService: TranslateService,
    private locationService: LocationService) {
  }

  ngOnInit(): void {

    this.coordinates$ = this.place.asObservable().pipe(
      filter((place) => isNotEmpty(place)),
      map((place) => place.coordinates),
    );

    this.pointers$ = this.place.asObservable().pipe(
      filter((place) => isNotEmpty(place)),
      map((place) => {
        const pointer: OpenStreetMapPointer = {
          coordinates: place.coordinates,
          color: 'green',
        };
        return [pointer];
      }),
    );

    this.displayName$ = this.place.asObservable().pipe(
      filter((place) => isNotEmpty(place)),
      map((place) => place.displayName),
    );

    if (this.locationService.isCoordinateString(this.coordinates)) {

      // Validate the coordinates, then retrieve the location name

      if (this.locationService.isValidCoordinateString(this.coordinates)) {
        const coordinates = this.locationService.parseCoordinates(this.coordinates);
        this.locationService.searchCoordinates(coordinates).subscribe({
          next: (displayName) => {
            const place: LocationPlace = {
              coordinates: coordinates,
              displayName: displayName, // Show the name retrieved from Nominatim
            };
            this.place.next(place);
          },
          error: (err) => {
            // show the map centered on provided coordinates despite the possibility to retrieve a description for the place
            const place: LocationPlace = {
              coordinates: coordinates,
            };
            this.place.next(place);
            if (err.message === LocationErrorCodes.API_ERROR) {
              console.error(err.message);
            } else {
              console.warn(err.message);
            }
          },
        });
      } else {
        console.error(`Invalid coordinates: "${this.coordinates}"`);
        this.invalidLocationErrorCode.next(LocationErrorCodes.INVALID_COORDINATES);
      }

    } else {

      // Retrieve the coordinates for the provided POI or address

      this.locationService.searchPlace(this.coordinates).subscribe({
        next: (place) => {
          place.displayName = this.coordinates; // Show the name stored in metadata (comment out to show name retrieved from Nominatim)
          this.place.next(place);
        },
        error: (err) => {
          this.invalidLocationErrorCode.next(err.message); // either LOCATION_NOT_FOUND or API_ERROR
          if (err.message === LocationErrorCodes.API_ERROR) {
            console.error(err.message);
          } else {
            console.warn(err.message);
          }
        },
      });
    }

  }

  increaseZoom() {
    this.zoom++;
  }

  decreaseZoom() {
    this.zoom--;
  }

}
