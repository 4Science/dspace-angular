import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AttachmentRenderingType, AttachmentTypeRendering } from '../../../attachment-type.decorator';
import { Item } from '../../../../../../../../../../../core/shared/item.model';
import { Bitstream } from '../../../../../../../../../../../core/shared/bitstream.model';
import { environment } from '../../../../../../../../../../../../environments/environment';
import {
  getBitstreamItemViewerDetailsPath,
  getBitstreamItemViewerPath
} from '../../../../../../../../../../../item-page/item-page-routing-paths';
import { FeatureID } from '../../../../../../../../../../../core/data/feature-authorization/feature-id';
import {
  AuthorizationDataService
} from '../../../../../../../../../../../core/data/feature-authorization/authorization-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'ds-media-viewer-button',
  templateUrl: './media-viewer-button.component.html',
  styleUrls: ['./media-viewer-button.component.scss'],
})
@AttachmentTypeRendering(AttachmentRenderingType.VIDEO, true)
@AttachmentTypeRendering(AttachmentRenderingType.AUDIO, true)
export class MediaViewerButtonComponent implements OnInit {

  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * The bitstream
   */
  @Input() bitstream: Bitstream;

  showButton$!: Observable<boolean>;

  constructor(
    private router: Router,
    private authorizationService: AuthorizationDataService,
  ) {}

  ngOnInit() {
    this.showButton$ = this.authorizationService.isAuthorized(FeatureID.CanDownload, this.bitstream?.self ?? undefined);
  }

  async openViewer() {
    if (environment.advancedAttachmentRendering.showViewerOnSameItemPage) {
      await this.router.navigate([getBitstreamItemViewerDetailsPath(this.item, this.bitstream, 'media')], {fragment: 'viewer'});
    } else {
      await this.router.navigate([getBitstreamItemViewerPath(this.item, this.bitstream, 'media')]);
    }
  }
}
