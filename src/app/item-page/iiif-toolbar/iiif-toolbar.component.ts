import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Item } from '../../core/shared/item.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { getItemViewerPath } from '../item-page-routing-paths';

@Component({
  selector: 'ds-iiif-toolbar',
  templateUrl: './iiif-toolbar.component.html',
  styleUrls: ['./iiif-toolbar.component.scss']
})
export class IIIFToolbarComponent implements OnInit {

  @Input()
  item: Item;

  // The path to the REST manifest endpoint.
  manifestUrl: string;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.manifestUrl = environment.rest.baseUrl + '/iiif/' + this.item.id + '/manifest';
  }

  openMiradorViewer() {
    this.router.navigate([getItemViewerPath(this.item, 'iiif')]);
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
