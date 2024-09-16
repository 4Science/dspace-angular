import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared.module';
import { CarouselComponent } from './carousel.component';

const COMPONENTS = [
  CarouselComponent,
];

const MODULES = [
  NgbCarouselModule,
  CommonModule,
];
const PROVIDERS = [];

@NgModule({
  imports: [
    ...MODULES,
    SharedModule,
  ],
  declarations: [
    ...COMPONENTS,
  ],
  providers: [
    ...PROVIDERS,
  ],
  exports: [
    ...COMPONENTS,
  ],
})

/**
 * This module handles all components, providers and modules that are needed for the menu
 */
export class CarouselModule {

}
