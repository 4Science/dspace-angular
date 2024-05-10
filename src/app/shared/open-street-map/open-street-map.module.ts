import { NgModule } from '@angular/core';

import { SharedModule } from '../shared.module';
import { OpenStreetMapComponent } from './open-street-map.component';
import { AngularOpenlayersModule } from 'ngx-openlayers';

const COMPONENTS = [
    OpenStreetMapComponent
];

@NgModule({
  imports: [
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
