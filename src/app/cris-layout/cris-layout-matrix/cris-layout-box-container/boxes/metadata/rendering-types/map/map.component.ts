import { Component, OnInit } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering, } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

@Component({
  selector: 'ds-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
@MetadataBoxFieldRendering(FieldRenderingType.MAP)
export class MapComponent extends RenderingTypeValueModelComponent implements OnInit {
  coordinates: string;
  ngOnInit(): void {
    this.coordinates = this.metadataValue.value;
  }
}
