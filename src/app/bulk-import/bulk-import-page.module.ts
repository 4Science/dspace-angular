import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { BulkImportGuard } from './bulk-import.guard';
import { BulkImportPageComponent } from './bulk-import-page.component';
import { BulkImportPageRoutingModule } from './bulk-import-page.routing.module';

/**
 * The module related to the bulk import.
 */
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BulkImportPageRoutingModule,
  ],
  declarations: [
    BulkImportPageComponent,
  ],
  providers: [
    BulkImportGuard,
  ],
})
export class BulkImportPageModule {

}
