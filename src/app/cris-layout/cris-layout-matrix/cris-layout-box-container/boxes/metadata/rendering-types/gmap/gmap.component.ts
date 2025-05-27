import { NgIf } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';

import { GooglemapsComponent } from '../../../../../../../shared/googlemaps/googlemaps.component';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

@Component({
  selector: 'ds-gmap',
  templateUrl: './gmap.component.html',
  styleUrls: ['./gmap.component.scss'],
  imports: [
    NgIf,
    GooglemapsComponent,
  ],
  standalone: true,
})
export class GmapComponent extends RenderingTypeValueModelComponent implements OnInit {
  coordinates: string;
  ngOnInit(): void {
    this.coordinates = this.metadataValue.value;
  }
}
