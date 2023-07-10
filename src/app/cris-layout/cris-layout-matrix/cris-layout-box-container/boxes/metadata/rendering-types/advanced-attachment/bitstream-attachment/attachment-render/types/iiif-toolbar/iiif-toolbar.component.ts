import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../../../../../../../../environments/environment';
import { Item } from '../../../../../../../../../../../core/shared/item.model';
import { NotificationsService } from '../../../../../../../../../../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import {
  getItemViewerDetailsPath,
  getItemViewerPath
} from '../../../../../../../../../../../item-page/item-page-routing-paths';
import { AttachmentRenderingType, AttachmentTypeRendering } from '../../../attachment-type.decorator';
import { FeatureID } from '../../../../../../../../../../../core/data/feature-authorization/feature-id';
import { isNotEmpty } from '../../../../../../../../../../../shared/empty.util';
import { AuthorizationDataService } from '../../../../../../../../../../../core/data/feature-authorization/authorization-data.service';
import { of } from 'rxjs';


@Component({
  selector: 'ds-iiif-toolbar',
  templateUrl: './iiif-toolbar.component.html',
  styleUrls: ['./iiif-toolbar.component.scss']
})

@AttachmentTypeRendering(AttachmentRenderingType.IIIF, true)
export class IIIFToolbarComponent implements OnInit {

  @Input()
  item: Item;

  // The path to the REST manifest endpoint.
  manifestUrl: string;

  iiifEnabled: boolean;

  isAuthorized$ = of(false);

  getObjectUrl() {
    return isNotEmpty(this.item) ? this.item.self : undefined;
  }

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected notificationsService: NotificationsService,
    protected authorizationService: AuthorizationDataService,
    protected translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.manifestUrl = environment.rest.baseUrl + '/iiif/' + this.item.id + '/manifest';
    this.isAuthorized$ = this.authorizationService.isAuthorized(FeatureID.CanDownload, this.getObjectUrl());
    this.iiifEnabled = this.isIIIFEnabled();
  }

  async openMiradorViewer() {
    if (environment.advancedAttachmentRendering.showViewerOnSameItemPage) {
      await this.router.navigate([ getItemViewerDetailsPath(this.item, 'iiif') ], { fragment: 'viewer' });
    } else {
      await this.router.navigate([ getItemViewerPath(this.item, 'iiif') ]);
    }
  }

  iiif() {
    this.copyManifestUrlToClipboard();
    this.openManifest();
  }

  openManifest() {
    window.open(this.manifestUrl, '_blank');
  }

  copyManifestUrlToClipboard() {
    navigator.clipboard.writeText(this.manifestUrl).then(() => {
      this.notificationsService.success(null, this.translate.get('iiiftoolbar.iiif.copy-clipboard-notification'));
    });
  }


  private isIIIFEnabled(): boolean {
    const regexIIIFItem = /true|yes/i;
    return regexIIIFItem.test(this.item.firstMetadataValue('dspace.iiif.enabled'));
  }

}
