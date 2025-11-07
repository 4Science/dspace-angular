import { Component, Input } from '@angular/core';
import {
  ItemPageCcLicenseFieldComponent
} from "../../../../../../../item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component";
import {RenderingTypeValueModelComponent} from "../rendering-type-value.model";

@Component({
  selector: 'ds-cc-license-large',
  standalone: true,
  imports: [ItemPageCcLicenseFieldComponent],
  templateUrl: './cc-license-large.component.html',
  styleUrl: './cc-license-large.component.scss'
})
export class CcLicenseLargeComponent extends RenderingTypeValueModelComponent {
  /**
   * 'full' variant shows image, a disclaimer (optional) and name (always), better for the item page content.
   * 'small' variant shows image and name (optional), better for the item page sidebar
   */
  @Input() variant = 'full';

  /**
   * Shows the CC license name with the image. Always show if image fails to load
   */
  @Input() showName? = true;

  /**
   * Filed name containing the CC license name, as configured in the back-end, in the 'dspace.cfg' file, propertie
   * 'cc.license.name'
   */
  @Input() ccLicenseNameField? = 'dc.rights';
}
