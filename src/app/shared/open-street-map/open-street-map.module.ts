import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared.module';
import { OpenStreetMapComponent } from './open-street-map.component';
import { AngularOpenlayersModule } from 'ngx-openlayers';

const COMPONENTS = [
    OpenStreetMapComponent
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AngularOpenlayersModule,
  ],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})

/**
 * This module handles open street maps functionalities
 */
export class OpenStreetMapModule {}
