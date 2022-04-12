import { NgModule } from '@angular/core';

import { SharedModule } from '../shared.module';
import { GooglemapsComponent } from './googlemaps.component';

const COMPONENTS = [
  GooglemapsComponent
];

@NgModule({
  imports: [ SharedModule ],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})

/**
 * This module handles google maps functionalities
 */
export class GooglemapsModule {}
