import { Component, Input } from '@angular/core';
import {RenderingTypeValueModelComponent} from "../rendering-type-value.model";
import {FieldRenderingType, MetadataBoxFieldRendering} from "../metadata-box.decorator";

@Component({
  selector: 'ds-cc-license-large',
  templateUrl: './cc-license-large.component.html',
  styleUrls: ['./cc-license-large.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.CCLICENSEFULL)
export class CcLicenseLargeComponent extends RenderingTypeValueModelComponent {

  /**
   * Filed name containing the CC license name, as configured in the back-end, in the 'dspace.cfg' file, propertie
   * 'cc.license.name'
   */
  @Input() ccLicenseNameField? = 'dc.rights';
}
