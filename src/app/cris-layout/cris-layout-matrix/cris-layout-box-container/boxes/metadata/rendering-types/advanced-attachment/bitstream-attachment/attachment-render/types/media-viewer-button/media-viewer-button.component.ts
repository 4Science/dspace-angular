import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { AttachmentRenderingType, AttachmentTypeRendering } from '../../../attachment-type.decorator';
import { Item } from '../../../../../../../../../../../core/shared/item.model';
import { Bitstream } from '../../../../../../../../../../../core/shared/bitstream.model';
import { environment } from '../../../../../../../../../../../../environments/environment';
import {
  getBitstreamItemViewerDetailsPath,
  getBitstreamItemViewerPath
} from '../../../../../../../../../../../item-page/item-page-routing-paths';

@Component({
  selector: 'ds-media-viewer-button',
  templateUrl: './media-viewer-button.component.html',
  styleUrls: ['./media-viewer-button.component.scss'],
})
@AttachmentTypeRendering(AttachmentRenderingType.VIDEO, true)
@AttachmentTypeRendering(AttachmentRenderingType.AUDIO, true)
export class MediaViewerButtonComponent {

  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * The bitstream
   */
  @Input() bitstream: Bitstream;
    constructor(
    private router: Router
  ) {}
  async openViewer() {
    if (environment.advancedAttachmentRendering.showViewerOnSameItemPage) {
      await this.router.navigate([getBitstreamItemViewerDetailsPath(this.item, this.bitstream, 'media')], {fragment: 'viewer'});
    } else {
      await this.router.navigate([getBitstreamItemViewerPath(this.item, this.bitstream, 'media')]);
    }
  }
}
