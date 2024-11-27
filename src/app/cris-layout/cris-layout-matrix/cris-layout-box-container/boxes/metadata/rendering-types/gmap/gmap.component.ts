import { NgIf } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';

import { GooglemapsModule } from '../../../../../../../shared/googlemaps/googlemaps.module';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

@Component({
  selector: 'ds-gmap',
  templateUrl: './gmap.component.html',
  styleUrls: ['./gmap.component.scss'],
  imports: [
    GooglemapsModule,
    NgIf,
  ],
  standalone: true,
})
export class GmapComponent extends RenderingTypeValueModelComponent implements OnInit {
  coordinates: string;
  ngOnInit(): void {
    this.coordinates = this.metadataValue.value;
  }
}
