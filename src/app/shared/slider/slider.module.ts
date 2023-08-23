import { NgModule } from '@angular/core';
import { SliderComponent } from './slider.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { ThemedSliderComponent } from './themed-slider.component';

const COMPONENTS = [
  ThemedSliderComponent,
  SliderComponent,
];

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})
/**
 * This module handles all components, providers and modules that are needed for the slider
 */
export class SliderModule {}
