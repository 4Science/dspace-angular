import { Component, Inject, OnInit } from '@angular/core';
import { RenderCrisLayoutBoxFor } from '../../../../decorators/cris-layout-box.decorator';
import { LayoutBox } from '../../../../enums/layout-box.enum';
import { CrisLayoutBoxModelComponent } from '../../../../models/cris-layout-box-component.model';
import { CrisLayoutBox } from '../../../../../core/layout/models/box.model';
import { Item } from '../../../../../core/shared/item.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ds-cris-layout-iiif-toolbar-box',
  templateUrl: './cris-layout-iiif-toolbar-box.component.html',
  styleUrls: ['./cris-layout-iiif-toolbar-box.component.scss']
})
@RenderCrisLayoutBoxFor(LayoutBox.IIIFTOOLBAR)
export class CrisLayoutIIIFToolbarBoxComponent extends CrisLayoutBoxModelComponent implements OnInit {

  constructor(
    protected translateService: TranslateService,
    @Inject('boxProvider') public boxProvider: CrisLayoutBox,
    @Inject('itemProvider') public itemProvider: Item
  ) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
