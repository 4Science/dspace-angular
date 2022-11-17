import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IIIFItemViewerComponent } from './item-viewers/iiif-item-viewer/iiif-item-viewer.component';
import { PdfBitstreamViewerComponent } from './bitstream-viewers/pdf-bitstream-viewer/pdf-bitstream-viewer.component';
import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { MiradorViewerModule } from '../../mirador-viewer/mirador-viewer.module';

const COMPONENTS = [
  IIIFItemViewerComponent,
  PdfBitstreamViewerComponent
];

@NgModule({
  declarations: [
    ...COMPONENTS
  ],
  imports: [
    CommonModule,
    PdfJsViewerModule,
    MiradorViewerModule
  ],
  exports: [
    ...COMPONENTS
  ]
})
export class ViewersSharedModule {
}
