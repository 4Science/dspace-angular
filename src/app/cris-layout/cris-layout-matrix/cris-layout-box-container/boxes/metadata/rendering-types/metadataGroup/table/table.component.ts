import {
  Component,
  Inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LayoutField } from '../../../../../../../../../app/core/layout/models/box.model';
import { Item } from '../../../../../../../../core/shared/item.model';
import { LoadMoreService } from '../../../../../../../services/load-more.service';
import {
  AsyncPipe,
  NgFor,
  NgIf,
} from '@angular/common';

import { MetadataRenderComponent } from '../../../row/metadata-container/metadata-render/metadata-render.component';
import { MetadataGroupComponent } from '../metadata-group.component';

/**
 * This component renders the table  metadata group fields
 */
@Component({
  selector: 'ds-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MetadataRenderComponent,
    AsyncPipe,
  ],
})
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
