import {
  Component,
  Input,
} from '@angular/core';

import { ItemPageCcLicenseFieldComponent } from '../../../../../../../item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

@Component({
  selector: 'ds-cc-license-large',
  standalone: true,
  imports: [ItemPageCcLicenseFieldComponent],
  templateUrl: './cc-license-large.component.html',
  styleUrl: './cc-license-large.component.scss',
})
export class CcLicenseLargeComponent extends RenderingTypeValueModelComponent {

  /**
   * Filed name containing the CC license name, as configured in the back-end, in the 'dspace.cfg' file, propertie
   * 'cc.license.name'
   */
  @Input() ccLicenseNameField? = 'dc.rights';
}
