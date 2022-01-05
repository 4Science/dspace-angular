import { NgModule } from '@angular/core';
import { GooglemapComponent } from './googlemap/googlemap.component';

const COMPONENTS = [
  GooglemapComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})

/**
 * This module handles google map when it has a address or coordinates
 */
export class GoogleMapModule {}
