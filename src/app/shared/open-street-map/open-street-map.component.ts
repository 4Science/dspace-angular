import {
  AsyncPipe,
  NgIf,
  NgStyle,
} from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  icon,
  LatLng,
  latLng,
  Layer,
  MapOptions,
  marker,
  tileLayer,
} from 'leaflet';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';
import {
  filter,
  map,
  tap,
} from 'rxjs/operators';

import {
  LocationDDCoordinates,
  LocationErrorCodes,
  LocationPlace,
  LocationService,
} from '../../core/services/location.service';
import { isNotEmpty } from '../empty.util';


@Component({
  selector: 'ds-open-street-map',
  templateUrl: './open-street-map.component.html',
  styleUrls: ['./open-street-map.component.scss'],
  imports: [
    TranslateModule,
    AsyncPipe,
    NgIf,
    LeafletModule,
    NgStyle,
  ],
  standalone: true,
})
export class OpenStreetMapComponent implements OnInit {

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
  coordinates$: Observable<LocationDDCoordinates>;

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
   * The styles that are being applied to the map container
   */
  mapStyle: {[key: string]: string} = {};

  /**
   * The center of the map
   */
  leafletCenter: LatLng;

  /**
   * The zoom level of the map
   */
  leafletZoom = 14;

  /**
   * The layers of the map
   */
  leafletLayers: Layer[] = [];

  /**
   * The options for the map
   */
  leafletOptions: MapOptions = {
    // attribution is still needed
    // attributionControl: false,
    zoomControl: this.showControlsZoom,
  };

  constructor(
    protected translateService: TranslateService,
    private locationService: LocationService,
    protected elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.mapStyle = {
      width: this.width || '100%',
      height: this.height || `${(+this.width || this.elementRef.nativeElement.parentElement.offsetWidth) / 2}px`,
    };

    this.coordinates$ = this.place.asObservable().pipe(
      filter(isNotEmpty),
      map(place => place.coordinates),
      tap(coordinates => this.setCenterAndPointer(coordinates)),
    );

    this.displayName$ = this.place.asObservable().pipe(
      filter(isNotEmpty),
      map(place => place.displayName),
    );

    const position = this.coordinates;

    if (this.locationService.isDecimalCoordinateString(position)) {
      this.handleDecimalCoordinates(position);
    } else if (this.locationService.isSexagesimalCoordinateString(position)) {
      this.handleSexagesimalCoordinates(position);
    } else {
      this.handlePlaceOrAddress(position);
    }
  }

  private handleDecimalCoordinates(position: string) {
    if (this.locationService.isValidCoordinateString(position)) {
      const coordinates = this.locationService.parseCoordinates(position);
      this.locationService.searchByCoordinates(coordinates).subscribe({
        next: displayName => this.place.next({ coordinates, displayName }),
        error: (err: unknown) => this.handleError(err, coordinates), // Specify type for err
      });
    } else {
      this.invalidLocationErrorCode.next(LocationErrorCodes.INVALID_COORDINATES);
    }
  }

  private handleSexagesimalCoordinates(position: string) {
    this.locationService.findPlaceAndDecimalCoordinates(position).subscribe({
      next: place => this.place.next(place),
      error: (err: unknown) => this.handleError(err, this.locationService.parseCoordinates(position)), // Specify type for err
    });
  }

  private handlePlaceOrAddress(position: string) {
    this.locationService.findPlaceCoordinates(position).subscribe({
      next: place => {
        place.displayName = position;
        this.place.next(place);
      },
      error: (err: unknown) => this.handleError(err, null),
    });
  }

  private handleError(error: unknown, coordinates: LocationDDCoordinates) {
    if (error instanceof Error) {
      this.invalidLocationErrorCode.next(error.message);
      this.place.next({ coordinates });
      console.error(error.message);
    }
  }

  private setCenterAndPointer(coordinates: LocationDDCoordinates) {
    this.leafletCenter = latLng(+coordinates.latitude, +coordinates.longitude);
    this.leafletLayers = [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'Leaflet' }),
      marker([+coordinates.latitude, +coordinates.longitude], {
        icon: icon({ iconUrl: 'assets/images/marker-icon.png', shadowUrl: 'assets/images/marker-shadow.png' }),
      }),
    ];
  }
}
