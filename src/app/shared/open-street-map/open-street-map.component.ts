import { Component, Input } from '@angular/core';
import { LocationCoordinates } from '../../core/services/location.service';

export interface OpenStreetMapPointer {
  coordinates: LocationCoordinates,
  color: string,
}

@Component({
  selector: 'ds-open-street-map',
  templateUrl: './open-street-map.component.html',
  styleUrls: ['./open-street-map.component.scss'],
})
export class OpenStreetMapComponent {

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
  @Input() coordinates: LocationCoordinates;

  /**
   * The pointers to be shown on the map
   */
  @Input() pointers: OpenStreetMapPointer[];

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

  increaseZoom() {
    this.zoom++;
  }

  decreaseZoom() {
    this.zoom--;
  }

}
