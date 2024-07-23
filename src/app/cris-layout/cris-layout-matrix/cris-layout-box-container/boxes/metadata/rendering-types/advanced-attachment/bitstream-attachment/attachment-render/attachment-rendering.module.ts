import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SearchModule } from '../../../../../../../../../shared/search/search.module';
import { SharedModule } from '../../../../../../../../../shared/shared.module';
import { FileDownloadButtonComponent } from './types/file-download-button/file-download-button.component';
import { IIIFToolbarComponent } from './types/iiif-toolbar/iiif-toolbar.component';
import { MediaViewerButtonComponent } from './types/media-viewer-button/media-viewer-button.component';
import { PdfViewerButtonComponent } from './types/pdf-viewer-button/pdf-viewer-button.component';

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
    TranslateModule,
  ],
  exports: [...COMPONENTS],
})
export class AttachmentRenderingModule {
}
