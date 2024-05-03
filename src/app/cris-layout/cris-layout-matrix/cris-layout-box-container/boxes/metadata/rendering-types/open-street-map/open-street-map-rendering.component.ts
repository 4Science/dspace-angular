import { Component, Inject, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../core/shared/item.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';

@Component({
  selector: 'ds-open-street-map-rendering',
  templateUrl: './open-street-map-rendering.component.html',
  styleUrls: ['./open-street-map-rendering.component.scss'],
})
@MetadataBoxFieldRendering(FieldRenderingType.OSMAP)
export class OpenStreetMapRenderingComponent extends RenderingTypeValueModelComponent implements OnInit {

  /**
   * The coordinates retrieved from the metadata, this may contain a pair or coordinate, a POI, or an address
   */
  coordinates: string;

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('metadataValueProvider') public metadataValueProvider: MetadataValue,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    @Inject('tabNameProvider') public tabNameProvider: string,
    protected translateService: TranslateService,
  ) {
    super(fieldProvider, itemProvider, metadataValueProvider, tabNameProvider, renderingSubTypeProvider, translateService);
  }

  ngOnInit(): void {
    this.coordinates = this.metadataValue.value;
  }

}
