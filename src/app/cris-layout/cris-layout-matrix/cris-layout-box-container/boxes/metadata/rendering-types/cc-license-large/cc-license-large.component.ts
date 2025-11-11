import {Component, Inject, Input} from '@angular/core';
import {RenderingTypeValueModelComponent} from '../rendering-type-value.model';
import {FieldRenderingType, MetadataBoxFieldRendering} from '../metadata-box.decorator';
import {MetadataGroupComponent} from "../metadataGroup/metadata-group.component";
import {LayoutField} from "../../../../../../../core/layout/models/box.model";
import {Item} from "../../../../../../../core/shared/item.model";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'ds-cc-license-large',
  templateUrl: './cc-license-large.component.html',
  styleUrls: ['./cc-license-large.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.CCLICENSEFULL)
export class CcLicenseLargeComponent extends MetadataGroupComponent {

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
