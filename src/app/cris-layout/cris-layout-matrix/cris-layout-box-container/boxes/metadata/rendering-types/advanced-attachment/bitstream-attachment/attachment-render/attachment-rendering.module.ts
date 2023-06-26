import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FileDownloadButtonComponent
} from '../../../../../../../../../shared/file-download-button/file-download-button.component';
import { SearchModule } from '../../../../../../../../../shared/search/search.module';
import { SharedModule } from '../../../../../../../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { IIIFToolbarComponent } from '../../../../../../../../../item-page/iiif-toolbar/iiif-toolbar.component';
import {
  PdfViewerButtonComponent
} from '../../../../../../../../../item-page/pdf-viewer-button/pdf-viewer-button.component';

const COMPONENTS = [
  FileDownloadButtonComponent,
  IIIFToolbarComponent,
  PdfViewerButtonComponent,
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
