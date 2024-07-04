import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { CrisItemPageComponent } from './cris-item-page.component';
import { CrisLayoutModule } from '../cris-layout/cris-layout.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { ItemSharedModule } from '../item-page/item-shared.module';
import { ItemVersionsModule } from '../item-page/versions/item-versions.module';

@NgModule({
  declarations: [
    CrisItemPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CrisLayoutModule,
    StatisticsModule,
    ItemSharedModule,
    ItemVersionsModule
  ],
  exports: [
    CrisItemPageComponent
  ]
})
export class CrisItemPageModule { }
