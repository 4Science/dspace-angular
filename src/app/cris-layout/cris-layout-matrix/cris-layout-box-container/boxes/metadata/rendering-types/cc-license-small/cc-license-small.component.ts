import {
  Component, Inject,
  Input,
} from '@angular/core';

import { ItemPageCcLicenseFieldComponent } from '../../../../../../../item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';
import {MetadataGroupComponent} from "../metadataGroup/metadata-group.component";
import {LayoutField} from "../../../../../../../core/layout/models/box.model";
import {Item} from "../../../../../../../core/shared/item.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'ds-cc-license-small',
  standalone: true,
  imports: [ItemPageCcLicenseFieldComponent],
  templateUrl: './cc-license-small.component.html',
  styleUrl: './cc-license-small.component.scss',
})
export class CcLicenseSmallComponent extends MetadataGroupComponent {

  dcRights: any;
  dcRightsUri: any;

  constructor(
  @Inject('fieldProvider') public fieldProvider: LayoutField,
  @Inject('itemProvider') public itemProvider: Item,
  @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
  @Inject('tabNameProvider') public tabNameProvider: string,
  protected translateService: TranslateService,
) {
  super(fieldProvider, itemProvider, renderingSubTypeProvider, tabNameProvider, translateService);
}
  ngOnInit(): void {
    super.ngOnInit();
    const ccLicenseEntryMetadata = this.componentsToBeRenderedMap.get(0);
    [this.dcRights, this.dcRightsUri] = ccLicenseEntryMetadata.map((entryMeta) => entryMeta.field.metadata);

  }
}
