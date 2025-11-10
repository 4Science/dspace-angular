import {Component, Input} from '@angular/core';
import {
  ItemPageCcLicenseFieldComponent
} from "../../../../../../../item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component";
import {RenderingTypeValueModelComponent} from "../rendering-type-value.model";
import {FieldRenderingType, MetadataBoxFieldRendering} from "../metadata-box.decorator";

@Component({
  selector: 'ds-cc-license-small',
  templateUrl: './cc-license-small.component.html',
  styleUrls: ['./cc-license-small.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.CCLICENSESMALL)
export class CcLicenseSmallComponent extends RenderingTypeValueModelComponent {


  /**
   * Filed name containing the CC license name, as configured in the back-end, in the 'dspace.cfg' file, propertie
   * 'cc.license.name'
   */
  @Input() ccLicenseNameField? = 'dc.rights';
}
