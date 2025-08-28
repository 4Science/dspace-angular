import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CrisLayoutBox } from '../../../../../core/layout/models/box.model';
import { Item } from '../../../../../core/shared/item.model';
import { CrisLayoutBoxModelComponent } from '../../../../models/cris-layout-box-component.model';
import { IIIFToolbarComponent } from '../metadata/rendering-types/advanced-attachment/bitstream-attachment/attachment-render/types/iiif-toolbar/iiif-toolbar.component';

@Component({
  selector: 'ds-cris-layout-iiif-toolbar-box',
  templateUrl: './cris-layout-iiif-toolbar-box.component.html',
  styleUrls: ['./cris-layout-iiif-toolbar-box.component.scss'],
  imports: [
    IIIFToolbarComponent,
  ],
  standalone: true,
})
export class CrisLayoutIIIFToolbarBoxComponent extends CrisLayoutBoxModelComponent implements OnInit {

  constructor(
    protected translateService: TranslateService,
    @Inject('boxProvider') public boxProvider: CrisLayoutBox,
    @Inject('itemProvider') public itemProvider: Item,
  ) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
