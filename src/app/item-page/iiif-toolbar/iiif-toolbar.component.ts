import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Item } from '../../core/shared/item.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { getItemViewerPath } from '../item-page-routing-paths';
import { Bitstream } from '../../core/shared/bitstream.model';

@Component({
  selector: 'ds-iiif-toolbar',
  templateUrl: './iiif-toolbar.component.html',
  styleUrls: ['./iiif-toolbar.component.scss']
})
export class IIIFToolbarComponent implements OnInit {

  private readonly MD_CANVASID = 'bitstream.iiif.canvasid';
  private readonly MD_CANVASID_NAME = 'canvasId';

  @Input()
  item: Item;

  @Input()
  bitstream: Bitstream;

  // The path to the REST manifest endpoint.
  manifestUrl: string;
  queryParams: {[key: string]: string};

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.manifestUrl = environment.rest.baseUrl + '/iiif/' + this.item.id + '/manifest';
    this.queryParams = this.getQueryParams();
  }

  private getQueryParams() {
    var canvasIdMetadata = this.bitstream?.metadata[`${this.MD_CANVASID}`];
    if (canvasIdMetadata != null && canvasIdMetadata.length > 0) {
      return { [`${this.MD_CANVASID_NAME}`]: canvasIdMetadata[0].value };
    }

    // default case: return bitstream identifier
    return { [`${this.MD_CANVASID_NAME}`]: this.bitstream?.uuid };
  }

  openMiradorViewer() {
    this.router.navigate(
      [getItemViewerPath(this.item, 'iiif')],
      { queryParams: this.queryParams }
    );
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

}
