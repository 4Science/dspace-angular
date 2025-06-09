import { Route } from '@angular/router';

import { BitstreamDownloadPageComponent } from '../bitstream-download-page/bitstream-download-page.component';
import { thumbnailsBitstreamResolver } from './thumbnails-bitstream-resolver';

/**
 * Routing module to navigate for thumbnail loading
 */
export const ROUTES: Route[] = [
  {
    // Resolve thumbnails bitstream download URLs
    path: ':bundle_uuid/view/:thumbnail_id',
    component: BitstreamDownloadPageComponent,
    resolve: {
      bitstream: thumbnailsBitstreamResolver,
    },
  },
];
