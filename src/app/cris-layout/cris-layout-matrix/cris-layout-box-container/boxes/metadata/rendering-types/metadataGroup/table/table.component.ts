import {
  Component,
  Inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LayoutField } from '../../../../../../../../../app/core/layout/models/box.model';
import { Item } from '../../../../../../../../core/shared/item.model';
import { LoadMoreService } from '../../../../../../../services/load-more.service';
import {
  FieldRenderingType,
  MetadataBoxFieldRendering,
} from '../../metadata-box.decorator';
import { MetadataGroupComponent } from '../metadata-group.component';

/**
 * This component renders the table  metadata group fields
 */
@Component({
  selector: 'ds-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
@MetadataBoxFieldRendering(FieldRenderingType.TABLE, true)
export class TableComponent extends MetadataGroupComponent {
  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    @Inject('tabNameProvider') public tabNameProvider: string,
    protected translateService: TranslateService,
    public loadMoreService: LoadMoreService,
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, tabNameProvider, translateService, loadMoreService);
  }
}
