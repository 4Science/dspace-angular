import { NgModule } from '@angular/core';
import { AngularOpenlayersModule } from 'ngx-openlayers';

import { SharedModule } from '../shared.module';
import { OpenStreetMapComponent } from './open-street-map.component';

const COMPONENTS = [
  OpenStreetMapComponent,
];

@NgModule({
  imports: [
    SharedModule,
    AngularOpenlayersModule,
  ],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS],
})

/**
 * This module handles open street maps functionalities
 */
export class OpenStreetMapModule {}
