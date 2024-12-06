import { Component, Inject, OnInit } from '@angular/core';
import { FieldRenderingType, MetadataBoxFieldRendering } from '../../metadata-box.decorator';
import { MetadataGroupComponent } from '../metadata-group.component';
import { LayoutField } from '../../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../../core/shared/item.model';
import { TranslateService } from '@ngx-translate/core';
import { LoadMoreService, NestedMetadataGroupEntry } from '../../../../../../../services/load-more.service';

@Component({
  selector: 'ds-openstreetmap-group',
  templateUrl: './openstreetmap-group.component.html',
  styleUrls: ['./openstreetmap-group.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.OSMAPGROUP,true)
export class OpenstreetmapGroupComponent extends MetadataGroupComponent implements OnInit {

  coordinates: string;

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    @Inject('tabNameProvider') public tabNameProvider: string,
    protected translateService: TranslateService,
    public loadMoreService: LoadMoreService
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, tabNameProvider, translateService, loadMoreService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const coordinatesEntryMetadata = this.componentsToBeRenderedMap.get(0);
    const [latitude, longitude] =  coordinatesEntryMetadata;
    const valueLatitude = this.getNestedMetadataValue(latitude);
    const valueLongitude = this.getNestedMetadataValue(longitude);
    this.coordinates = `${valueLatitude},${valueLongitude}`;
  }
  getNestedMetadataValue(nestedMetadaGroupEntry: NestedMetadataGroupEntry){
    return nestedMetadaGroupEntry?.value?.value;
  }
}
