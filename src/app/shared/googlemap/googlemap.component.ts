import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

import {} from 'googlemaps';
@Component({
  selector: 'ds-googlemap',
  templateUrl: './googlemap.component.html',
  styleUrls: ['./googlemap.component.scss'],
})
export class GooglemapComponent implements OnInit, AfterViewInit {
  @Input() coordinates: string;
  @ViewChild('map') mapElement: any;
  map: google.maps.Map;
  latitude: string;
  longitude: string;



  ngOnInit(): void {
    this.setLatitudeAndLongitude();
  }

  setLatitudeAndLongitude() {
    [this.latitude, this.longitude] = this.coordinates
      .replace('@', '')
      .split(',');
  }

  ngAfterViewInit(): void {
    this.mapInitializer();
  }

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
