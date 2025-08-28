import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../../../../../../../../environments/environment';
import { AuthorizationDataService } from '../../../../../../../../../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../../../../../../../../../core/data/feature-authorization/feature-id';
import { Bitstream } from '../../../../../../../../../../../core/shared/bitstream.model';
import { Item } from '../../../../../../../../../../../core/shared/item.model';
import {
  getBitstreamItemViewerDetailsPath,
  getBitstreamItemViewerPath,
} from '../../../../../../../../../../../item-page/item-page-routing-paths';
import { isNotEmpty } from '../../../../../../../../../../../shared/empty.util';

@Component({
  selector: 'ds-pdf-viewer-button',
  templateUrl: './pdf-viewer-button.component.html',
  styleUrls: ['./pdf-viewer-button.component.scss'],
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
  ],
  standalone: true,
})
export class PdfViewerButtonComponent implements OnInit {

  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * The bitstream
   */
  @Input() bitstream: Bitstream;
  /**
   * The tab name
   */
  @Input() tabName: string;

  constructor(
    private router: Router,
    private authorizationService: AuthorizationDataService,
  ) {}

  canOpenPdf$: Observable<boolean>;

  ngOnInit(): void {
    this.canOpenPdf$ = this.authorizationService.isAuthorized(FeatureID.CanDownload, isNotEmpty(this.bitstream) ? this.bitstream.self : undefined);
  }

  public async openPdfViewer() {
    if (environment.advancedAttachmentRendering.showViewerOnSameItemPage) {
      await this.router.navigate([ getBitstreamItemViewerDetailsPath(this.item, this.bitstream, 'pdf', this.tabName) ], { fragment: 'viewer' });
    } else {
      await this.router.navigate([ getBitstreamItemViewerPath(this.item, this.bitstream, 'pdf') ]);
    }
  }

}
