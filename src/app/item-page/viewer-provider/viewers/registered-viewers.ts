import { IIIFItemViewerComponent } from './item-viewers/iiif-item-viewer/iiif-item-viewer.component';
import { PdfBitstreamViewerComponent } from './bitstream-viewers/pdf-bitstream-viewer/pdf-bitstream-viewer.component';
import {MediaItemViewerComponent} from './item-viewers/media-item-viewer/media-item-viewer.component';

export const REGISTERED_VIEWERS = {
  iiif: IIIFItemViewerComponent,
  video: IIIFItemViewerComponent,
  audio: IIIFItemViewerComponent,
  pdf: PdfBitstreamViewerComponent,
  media: MediaItemViewerComponent
};
