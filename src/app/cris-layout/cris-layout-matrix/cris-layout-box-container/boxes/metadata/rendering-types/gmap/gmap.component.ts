import { Component, OnInit } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering, } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

@Component({
  selector: 'ds-gmap',
  templateUrl: './gmap.component.html',
  styleUrls: ['./gmap.component.scss'],
})
@MetadataBoxFieldRendering(FieldRenderingType.GMAP)
export class GmapComponent extends RenderingTypeValueModelComponent implements OnInit {
  coordinates: string;
  ngOnInit(): void {
    this.coordinates = this.metadataValue.value;
  }
}
