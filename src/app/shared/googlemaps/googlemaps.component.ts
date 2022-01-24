import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, Renderer2, ViewChild, } from '@angular/core';

import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { isNotEmpty } from '../empty.util';
import { RemoteData } from '../../core/data/remote-data';
import { ConfigurationProperty } from '../../core/shared/configuration-property.model';

@Component({
  selector: 'ds-googlemaps',
  templateUrl: './googlemaps.component.html',
  styleUrls: ['./googlemaps.component.scss'],
})
export class GooglemapsComponent implements OnInit {
  /**
   * The coordinates used as input by google maps
   */
  @Input() coordinates: string;

  /**
   * The reference to map div container
   */
  @ViewChild('map') mapElement: any;

  /**
   * The google map object
   */
  map: google.maps.Map;

  /**
   * The latitude value
   */
  latitude: string;

  /**
   * the longitude value
   */
  longitude: string;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private renderer: Renderer2,
    private configService: ConfigurationDataService,
  ) {
  }

  /**
   * Retrieve the google maps api key and initialize the maps
   */
  ngOnInit() {
    if (this.coordinates) {
      this.configService.findByPropertyName('google.maps.key').pipe(
        getFirstCompletedRemoteData(),
      ).subscribe((res: RemoteData<ConfigurationProperty>) => {
        if (res.hasSucceeded && isNotEmpty(res?.payload?.values[0])) {
          this.loadScript(this.buildMapUrl(res?.payload?.values[0])).then(() => {
            this.loadMap();
          });
        }
      });
    }
  }

  /**
   * Return the google map ur with google maps api key
   *
   * @param key contains a secret key of a google maps
   * @returns string which has google map url with google maps key
   */
  buildMapUrl(key: string) {
    return `https://maps.googleapis.com/maps/api/js?key=${key}`;
  }

  /**
   * Set latitude and longitude when metadata has an address
   */
  setLatAndLongFromAddress() {
    return new Promise((reslove, reject) => {
      new google.maps.Geocoder().geocode({ 'address': this.coordinates }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          this.latitude = results[0].geometry.location.lat().toString();
          this.longitude = results[0].geometry.location.lng().toString();
          reslove(1);
        } else {
          reject(1);
        }
      });
    });
  }

  /**
   * It initialize a google maps to html page
   */
  mapInitializer() {
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: new google.maps.LatLng(
        Number(this.latitude),
        Number(this.longitude)
      ),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    // tslint:disable-next-line: no-unused-expression
    new google.maps.Marker({
      position: new google.maps.LatLng(
        Number(this.latitude),
        Number(this.longitude)
      ),
      map: this.map,
    });
  }

  /**
   * Load map in both the case when metadata has coordinates or address
   */
  private async loadMap() {
    if (this.coordinates.includes('@')) {
      [this.latitude, this.longitude] = this.coordinates
        .replace('@', '')
        .split(',');
      this.mapInitializer();
    } else {
      await this.setLatAndLongFromAddress();
      this.mapInitializer();
    }
  }

  /**
   * Append the google maps script to the document
   *
   * @param url contains a script url which will be loaded into page
   * @returns A promise
   */
  private loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.text = ``;
      script.onload = resolve;
      script.onerror = reject;
      this.renderer.appendChild(this._document.head, script);
    });
  }
}
