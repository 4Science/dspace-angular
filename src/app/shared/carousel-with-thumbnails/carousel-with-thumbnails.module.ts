import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared.module';
import { SliderModule } from '../slider/slider.module';
import { CarouselWithThumbnailsComponent } from './carousel-with-thumbnails.component';
import { ThemedCarouselWithThumbnailsComponent } from './themed-carousel-with-thumbnails.component';

const COMPONENTS = [
  ThemedCarouselWithThumbnailsComponent,
  CarouselWithThumbnailsComponent,
];

const MODULES = [
  NgbCarouselModule,
  CommonModule,
  SliderModule,
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
export class CarouselWithThumbnailsModule {

}
