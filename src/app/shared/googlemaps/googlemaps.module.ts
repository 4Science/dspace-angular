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
 * This module handles google map when it has a address or coordinates
 */
export class GooglemapsModule {}
