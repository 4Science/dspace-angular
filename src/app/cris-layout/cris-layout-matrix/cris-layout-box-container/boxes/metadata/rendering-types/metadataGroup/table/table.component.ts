import { Component, Inject } from '@angular/core';
import { FieldRenderingType, MetadataBoxFieldRendering } from '../../metadata-box.decorator';
import { MetadataGroupComponent } from '../metadata-group.component';
import { LoadMoreService } from 'src/app/cris-layout/services/load-more.service';
import { LayoutField } from 'src/app/core/layout/models/box.model';
import { Item } from 'src/app/core/shared/item.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * This component renders the table  metadata group fields
 */
@Component({
  selector: 'ds-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.TABLE, true)
export class TableComponent extends MetadataGroupComponent {
  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    protected translateService: TranslateService,
    public loadMoreService: LoadMoreService
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, translateService, loadMoreService);
  }
}
