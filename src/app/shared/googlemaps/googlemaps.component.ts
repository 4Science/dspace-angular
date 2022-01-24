import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, Renderer2, ViewChild, } from '@angular/core';

import { ConfigurationDataService } from '../../core/data/configuration-data.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';

@Component({
  selector: 'ds-googlemaps',
  templateUrl: './googlemaps.component.html',
  styleUrls: ['./googlemaps.component.scss'],
})
export class GooglemapsComponent implements OnInit {
  @Input() coordinates: string;
  @ViewChild('map') mapElement: any;
  map: google.maps.Map;
  latitude: string;
  longitude: string;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private renderer: Renderer2,
    private configService: ConfigurationDataService,
  ) {
  }

  ngOnInit() {
    if (this.coordinates) {
      this.configService.findByPropertyName('google.maps.key').pipe(
        getFirstCompletedRemoteData(),
      ).subscribe((data) => {
        this.loadScript(this.buildMapUrl(data?.payload?.values[0])).then(() => {
          this.loadMap();
        });
      });
    }
  }

  /**
   *
   * @param key contains a secret key of a google map
   * @returns string which has google map url with google map key
   */
  buildMapUrl(key: string) {
    return `https://maps.googleapis.com/maps/api/js?key=${key}`;
  }

  /**
   * Set latitude and longitude when matadata has a address
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
   * It initialize a google map to html page
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
   * load map map in both the case when matadata has coordinates or address
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
   *
   * @param url contains a script url which will be loaded into page
   * @returns
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
