import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IIIFItemViewerComponent } from './item-viewers/iiif-item-viewer/iiif-item-viewer.component';
import { PdfBitstreamViewerComponent } from './bitstream-viewers/pdf-bitstream-viewer/pdf-bitstream-viewer.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { MiradorViewerModule } from '../../mirador-viewer/mirador-viewer.module';
import { SharedModule } from '../../../shared/shared.module';
import { MediaItemViewerComponent } from './item-viewers/media-item-viewer/media-item-viewer.component';
import { MediaPlayerModule } from '../../../shared/media-player/media-player.module';

const COMPONENTS = [
  IIIFItemViewerComponent,
  PdfBitstreamViewerComponent,
  MediaItemViewerComponent
];

@NgModule({
  declarations: [
    ...COMPONENTS
  ],
  imports: [
    CommonModule,
    PdfJsViewerModule,
    MiradorViewerModule,
    SharedModule,
    MediaPlayerModule
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class ViewersSharedModule {
}
