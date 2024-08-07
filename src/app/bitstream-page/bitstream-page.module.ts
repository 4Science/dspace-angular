import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormModule } from '../shared/form/form.module';
import { ResourcePoliciesModule } from '../shared/resource-policies/resource-policies.module';
import { SharedModule } from '../shared/shared.module';
import { BitstreamAuthorizationsComponent } from './bitstream-authorizations/bitstream-authorizations.component';
import { BitstreamDownloadPageComponent } from './bitstream-download-page/bitstream-download-page.component';
import { BitstreamPageRoutingModule } from './bitstream-page-routing.module';
import { EditBitstreamPageComponent } from './edit-bitstream-page/edit-bitstream-page.component';
import { ThemedEditBitstreamPageComponent } from './edit-bitstream-page/themed-edit-bitstream-page.component';

/**
 * This module handles all components that are necessary for Bitstream related pages
 */
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BitstreamPageRoutingModule,
    FormModule,
    ResourcePoliciesModule,
  ],
  declarations: [
    BitstreamAuthorizationsComponent,
    EditBitstreamPageComponent,
    ThemedEditBitstreamPageComponent,
    BitstreamDownloadPageComponent,
  ],
})
export class BitstreamPageModule {
}
