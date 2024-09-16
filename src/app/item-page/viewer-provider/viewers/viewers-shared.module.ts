import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';

import { MediaPlayerModule } from '../../../shared/media-player/media-player.module';
import { SharedModule } from '../../../shared/shared.module';
import { MiradorViewerModule } from '../../mirador-viewer/mirador-viewer.module';
import { PdfBitstreamViewerComponent } from './bitstream-viewers/pdf-bitstream-viewer/pdf-bitstream-viewer.component';
import { IIIFItemViewerComponent } from './item-viewers/iiif-item-viewer/iiif-item-viewer.component';
import { MediaItemViewerComponent } from './item-viewers/media-item-viewer/media-item-viewer.component';

const COMPONENTS = [
  IIIFItemViewerComponent,
  PdfBitstreamViewerComponent,
  MediaItemViewerComponent,
];

@NgModule({
  declarations: [
    ...COMPONENTS,
  ],
  imports: [
    CommonModule,
    PdfJsViewerModule,
    MiradorViewerModule,
    SharedModule,
    MediaPlayerModule,
  ],
  exports: [
    ...COMPONENTS,
  ],
})
export class ViewersSharedModule {
}
