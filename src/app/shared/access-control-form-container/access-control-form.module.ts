import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared.module';
import { AccessControlArrayFormComponent } from './access-control-array-form/access-control-array-form.component';
import { ToDatePipe } from './access-control-array-form/to-date.pipe';
import { AccessControlFormContainerComponent } from './access-control-form-container.component';
import { ItemAccessControlSelectBitstreamsModalComponent } from './item-access-control-select-bitstreams-modal/item-access-control-select-bitstreams-modal.component';
import { ItemAccessControlSelectBundlesModalComponent } from './item-access-control-select-bundles-modal/item-access-control-select-bundles-modal.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    NgbDatepickerModule,
  ],
  declarations: [
    AccessControlFormContainerComponent,
    AccessControlArrayFormComponent,
    ItemAccessControlSelectBitstreamsModalComponent,
    ItemAccessControlSelectBundlesModalComponent,
    ToDatePipe,
  ],
  exports: [ AccessControlFormContainerComponent, AccessControlArrayFormComponent ],
})
export class AccessControlFormModule {}
