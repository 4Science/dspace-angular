import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { FileDownloadButtonComponent } from './types/file-download-button/file-download-button.component';
import { SearchModule } from '../../../../../../../../../shared/search/search.module';
import { SharedModule } from '../../../../../../../../../shared/shared.module';
import { IIIFToolbarComponent } from './types/iiif-toolbar/iiif-toolbar.component';
import { PdfViewerButtonComponent } from './types/pdf-viewer-button/pdf-viewer-button.component';
import { MediaViewerButtonComponent } from './types/media-viewer-button/media-viewer-button.component';

const COMPONENTS = [
  FileDownloadButtonComponent,
  IIIFToolbarComponent,
  PdfViewerButtonComponent,
  MediaViewerButtonComponent,
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    SearchModule,
    SharedModule,
    TranslateModule
  ],
  exports: [...COMPONENTS]
})
export class AttachmentRenderingModule {
}
