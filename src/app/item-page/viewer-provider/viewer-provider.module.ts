import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViewerProviderRoutingModule } from './viewer-provider-routing.module';
import { ViewerProviderComponent } from './viewer-provider.component';
import { SharedModule } from '../../shared/shared.module';
import { ViewerProviderDirective } from './directives/viewer-provider.directive';
import { ViewersSharedModule } from './viewers/viewers-shared.module';

const ENTRY_COMPONENTS = [
  ViewerProviderComponent
];

@NgModule({
  declarations: [
    ViewerProviderComponent,
    ViewerProviderDirective
  ],
  imports: [
    CommonModule,
    SharedModule,
    ViewerProviderRoutingModule,
    ViewersSharedModule
  ]
})
export class ViewerProviderModule {
  static withEntryComponents() {
    return {
      ngModule: ViewerProviderModule,
      providers: ENTRY_COMPONENTS.map((component) => ({ provide: component }))
    };
  }
}
