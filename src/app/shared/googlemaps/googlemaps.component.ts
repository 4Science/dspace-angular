import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit, Renderer2, ViewChild, } from '@angular/core';

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
    private renderer: Renderer2
  ) {
  }

  ngOnInit() {
    const url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDnzexA2pwD-7UFicRIctj4-vhkj48G_8A';

    this.loadScript(url).then(() => {
      this.loadMap();
    });
  }

  private loadMap() {
    const map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 0, lng: 0 },
      zoom: 1,
    });
  }


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

/*
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

  /!**
   * Set latitude and longitude when matadata has a address
   *!/
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

  /!**
   * It initialize a google map to html page
   *!/
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

  /!**
   * it's inject a google map script dynamically into page
   *!/
  initializeScript(): any {
    const script = this._document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDnzexA2pwD-7UFicRIctj4-vhkj48G_8A';
    this._document.body.appendChild(script);
  }*/
}
