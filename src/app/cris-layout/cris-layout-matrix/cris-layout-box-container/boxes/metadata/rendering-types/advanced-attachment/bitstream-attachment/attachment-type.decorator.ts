import { Component } from '@angular/core';

import { GenericConstructor } from '../../../../../../../../core/shared/generic-constructor';
import { FileDownloadButtonComponent } from './attachment-render/types/file-download-button/file-download-button.component';
import { IIIFToolbarComponent } from './attachment-render/types/iiif-toolbar/iiif-toolbar.component';
import { MediaViewerButtonComponent } from './attachment-render/types/media-viewer-button/media-viewer-button.component';
import { PdfViewerButtonComponent } from './attachment-render/types/pdf-viewer-button/pdf-viewer-button.component';

export enum AttachmentRenderingType {
  DOWNLOAD = 'DOWNLOAD',
  IIIF = 'IIIF',
  PDF = 'PDF',
  VIDEO = 'VIDEO-STREAMING',
  AUDIO = 'AUDIO-STREAMING'
}

const fieldType = new Map();

fieldType.set(AttachmentRenderingType.DOWNLOAD, {
  componentRef: FileDownloadButtonComponent,
  structured: true,
} as AttachmentTypeFieldRenderOptions);
fieldType.set(AttachmentRenderingType.IIIF, {
  componentRef: IIIFToolbarComponent,
  structured: true,
} as AttachmentTypeFieldRenderOptions);
fieldType.set(AttachmentRenderingType.PDF, {
  componentRef: PdfViewerButtonComponent,
  structured: true,
} as AttachmentTypeFieldRenderOptions);
fieldType.set(AttachmentRenderingType.VIDEO, {
  componentRef: MediaViewerButtonComponent,
  structured: true,
} as AttachmentTypeFieldRenderOptions);
fieldType.set(AttachmentRenderingType.AUDIO, {
  componentRef: MediaViewerButtonComponent,
  structured: true,
} as AttachmentTypeFieldRenderOptions);


export interface AttachmentTypeFieldRenderOptions {
  componentRef: GenericConstructor<Component>;
  structured: boolean;
}

export function AttachmentTypeRendering(objectType: AttachmentRenderingType, structured = false) {
  return function decorator(component: any) {
    if (objectType) {
      fieldType.set(objectType, {
        componentRef: component,
        structured: structured,
      } as AttachmentTypeFieldRenderOptions);
    }
  };
}

export function getAttachmentTypeRendering(objectType: string): AttachmentTypeFieldRenderOptions {
  return fieldType.get(objectType.toUpperCase());
}
