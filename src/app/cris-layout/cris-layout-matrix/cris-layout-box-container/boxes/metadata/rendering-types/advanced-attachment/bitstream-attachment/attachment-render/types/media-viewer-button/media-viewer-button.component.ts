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

@Component({
  selector: 'ds-media-viewer-button',
  templateUrl: './media-viewer-button.component.html',
  styleUrls: ['./media-viewer-button.component.scss'],
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
  ],
  standalone: true,
})
export class MediaViewerButtonComponent implements OnInit {

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
      await this.router.navigate([getBitstreamItemViewerDetailsPath(this.item, this.bitstream, 'media', this.tabName)], { fragment: 'viewer' });
    } else {
      await this.router.navigate([getBitstreamItemViewerPath(this.item, this.bitstream, 'media')]);
    }
  }
}
