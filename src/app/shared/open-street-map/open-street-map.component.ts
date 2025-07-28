import {
  AsyncPipe,
  isPlatformBrowser,
  NgIf,
  NgStyle,
} from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
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
    NgStyle,
  ],
  standalone: true,
})
export class OpenStreetMapComponent implements OnInit, OnDestroy {

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

  @ViewChild('mapContainer', { static: true }) mapContainer: ElementRef<HTMLDivElement>;

  private leaflet: any;
  private map: any;
  private marker: any;
  private subscriptions: Subscription[] = [];

  isBrowser: boolean;

  constructor(
    protected translateService: TranslateService,
    private locationService: LocationService,
    protected elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) {
      return;
    }
    this.leaflet = require('leaflet');

    this.subscriptions.push(this.place.asObservable().pipe(
      filter(isNotEmpty),
      map(place => place.coordinates),
      tap(coordinates => this.setCenterAndPointer(coordinates)),
    ).subscribe());

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

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private handleDecimalCoordinates(position: string) {
    if (this.locationService.isValidCoordinateString(position)) {
      const coordinates = this.locationService.parseCoordinates(position);
      const sub = this.locationService.searchByCoordinates(coordinates).subscribe({
        next: displayName => this.place.next({ coordinates, displayName }),
        error: (err: unknown) => this.handleError(err, coordinates), // Specify type for err
      });
      this.subscriptions.push(sub);
    } else {
      this.invalidLocationErrorCode.next(LocationErrorCodes.INVALID_COORDINATES);
    }
  }

  private handleSexagesimalCoordinates(position: string) {
    const sub = this.locationService.findPlaceAndDecimalCoordinates(position).subscribe({
      next: place => this.place.next(place),
      error: (err: unknown) => this.handleError(err, this.locationService.parseCoordinates(position)), // Specify type for err
    });
    this.subscriptions.push(sub);
  }

  private handlePlaceOrAddress(position: string) {
    const sub = this.locationService.findPlaceCoordinates(position).subscribe({
      next: place => {
        place.displayName = position;
        this.place.next(place);
      },
      error: (err: unknown) => this.handleError(err, null),
    });
    this.subscriptions.push(sub);
  }

  private handleError(error: unknown, coordinates: LocationDDCoordinates) {
    if (error instanceof Error) {
      this.invalidLocationErrorCode.next(error.message);
      this.place.next({ coordinates });
      console.error(error.message);
    }
  }

  private setCenterAndPointer(coordinates: LocationDDCoordinates) {
    if (!this.isBrowser) {
      return;
    }

    this.mapStyle = {
      width: this.width || '100%',
      height: this.height || `${(+this.width || this.elementRef.nativeElement.parentElement.offsetWidth) / 2}px`,
    };

    if (!this.map) {
      this.map = this.leaflet.map(this.mapContainer.nativeElement, {
        center: [coordinates.latitude, coordinates.longitude],
        zoom: 14,
        zoomControl: this.showControlsZoom,
      });
      this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 1,
        attribution: 'Leaflet',
      }).addTo(this.map);
    } else {
      this.map.setView([coordinates.latitude, coordinates.longitude], 14);
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
    }
    this.marker = this.leaflet.marker([coordinates.latitude, coordinates.longitude], {
      icon: this.leaflet.icon({
        iconUrl: 'assets/images/marker-icon.png',
        shadowUrl: 'assets/images/marker-shadow.png',
      }),
    }).addTo(this.map);
    setTimeout(() => {
      this.map.invalidateSize();
    });
  }
}
