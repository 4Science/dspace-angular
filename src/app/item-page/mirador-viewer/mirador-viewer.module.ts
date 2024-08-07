import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { MiradorViewerComponent } from './mirador-viewer.component';


@NgModule({
  declarations: [
    MiradorViewerComponent,
  ],
  exports: [
    MiradorViewerComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
  ],
})
export class MiradorViewerModule { }
