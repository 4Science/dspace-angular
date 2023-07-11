import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {BitstreamDownloadPageComponent} from '../bitstream-download-page/bitstream-download-page.component';
import {ThumbnailsBitstreamResolver} from './thumbnails-bitstream-resolver';

/**
 * Routing module to navigate for thumbnail loading
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        // Resolve thumbnails bitstream download URLs
        path: ':bundle_uuid/view/:thumbnail_id',
        component: BitstreamDownloadPageComponent,
        resolve: {
          bitstream: ThumbnailsBitstreamResolver
        }
      }
    ])
  ],
  providers: [
    ThumbnailsBitstreamResolver
  ]
})
export class BundlePageRoutingModule {
}
