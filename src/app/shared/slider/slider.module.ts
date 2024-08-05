import { NgModule } from '@angular/core';
import { LinkSliderComponent } from './link-slider/link-slider.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { ThemedLinkSliderComponent } from './link-slider/themed-link-slider.component';
import { ThumbnailSliderComponent } from './thumbnail-slider/thumbnail-slider.component';

const COMPONENTS = [
  ThemedLinkSliderComponent,
  LinkSliderComponent,
  ThumbnailSliderComponent,
];

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    ...COMPONENTS,
  ],
  exports: [...COMPONENTS]
})
/**
 * This module handles all components, providers and modules that are needed for the slider
 */
export class SliderModule {}
