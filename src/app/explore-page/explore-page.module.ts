import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ExploreRoutingModule } from './explore-routing.module';
import { ExplorePageComponent } from './explore-page.component';
import { ExploreModule } from '../shared/explore/explore.module';
import { ThemedExplorePageComponent } from "./themed-explore-page.component";

@NgModule({
  imports: [
    ExploreRoutingModule,
    CommonModule,
    SharedModule,
    ExploreModule
  ],
  declarations: [
    ExplorePageComponent,
    ThemedExplorePageComponent
  ],
  providers: [],
  entryComponents: [
    ExplorePageComponent
  ],
  exports: [
    ThemedExplorePageComponent
  ]
})
export class ExplorePageModule {

}
