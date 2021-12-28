import { Component } from '@angular/core';
import {
  FieldRenderingType,
  MetadataBoxFieldRendering,
} from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

@Component({
  selector: 'ds-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
@MetadataBoxFieldRendering(FieldRenderingType.MAP)
export class MapComponent
  extends RenderingTypeValueModelComponent {
  getCoordinates() {
    return this.item?.metadata['organization.address.addressLocality'][0]?.value;
  }
}
