import { Component, Input, OnInit } from '@angular/core';
import {
  getBitstreamItemViewerDetailsPath,
  getBitstreamItemViewerPath
} from '../item-page-routing-paths';
import { Router } from '@angular/router';
import { Item } from '../../core/shared/item.model';
import { Bitstream } from '../../core/shared/bitstream.model';
import {
  AttachmentRenderingType,
  AttachmentTypeRendering
} from '../../cris-layout/cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/advanced-attachment/bitstream-attachment/attachment-type.decorator';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { isNotEmpty } from '../../shared/empty.util';
import { Observable } from 'rxjs';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ds-pdf-viewer-button',
  templateUrl: './pdf-viewer-button.component.html',
  styleUrls: ['./pdf-viewer-button.component.scss']
})

@AttachmentTypeRendering(AttachmentRenderingType.PDF, true)
export class PdfViewerButtonComponent implements OnInit {

  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * The bitstream
   */
  @Input() bitstream: Bitstream;

  constructor(
    private router: Router,
    private authorizationService: AuthorizationDataService
  ) {}

  canOpenPdf$: Observable<boolean>;

  ngOnInit(): void {
    this.canOpenPdf$ = this.authorizationService.isAuthorized(FeatureID.CanDownload, isNotEmpty(this.bitstream) ? this.bitstream.self : undefined);
  }

  public async openPdfViewer() {
    if (environment.advancedAttachmentRendering.showViewerOnSameItemPage) {
      await this.router.navigate([ getBitstreamItemViewerDetailsPath(this.item, this.bitstream, 'pdf') ], { fragment: 'viewer' });
    } else {
      await this.router.navigate([ getBitstreamItemViewerPath(this.item, this.bitstream, 'pdf') ]);
    }
  }

}
