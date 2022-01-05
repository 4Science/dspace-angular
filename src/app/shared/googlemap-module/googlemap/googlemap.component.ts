import {
  Component,
  Input,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

import {} from 'googlemaps';
@Component({
  selector: 'ds-googlemap',
  templateUrl: './googlemap.component.html',
  styleUrls: ['./googlemap.component.scss'],
})
export class GooglemapComponent implements AfterViewInit {
  @Input() coordinates: string;
  @ViewChild('map') mapElement: any;
  map: google.maps.Map;
  latitude: string;
  longitude: string;


 async ngAfterViewInit(): Promise<void> {
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
 * Set latitude and longitude when matadata has a address
 */
  setLatAndLongFromAddress() {
   return new Promise((reslove,reject) => {
    new google.maps.Geocoder().geocode({ 'address': this.coordinates },  (results, status) => {
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
}
