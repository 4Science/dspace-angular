import { Component, Inject, OnInit } from '@angular/core';
import { RenderCrisLayoutBoxFor } from '../../../../decorators/cris-layout-box.decorator';
import { LayoutBox } from '../../../../enums/layout-box.enum';
import { CrisLayoutBoxModelComponent } from '../../../../models/cris-layout-box-component.model';
import { CrisLayoutBox } from '../../../../../core/layout/models/box.model';
import { Item } from '../../../../../core/shared/item.model';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';

@Component({
  selector: 'ds-cris-layout-iiif-toolbar-box',
  templateUrl: './cris-layout-iiif-toolbar-box.component.html',
  styleUrls: ['./cris-layout-iiif-toolbar-box.component.scss']
})
@RenderCrisLayoutBoxFor(LayoutBox.IIIFTOOLBAR)
export class CrisLayoutIIIFToolbarBoxComponent extends CrisLayoutBoxModelComponent implements OnInit {

  // The path to the REST manifest endpoint.
  manifestUrl: string;

  constructor(
    protected translateService: TranslateService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected notificationsService: NotificationsService,
    protected translate: TranslateService,
    @Inject('boxProvider') public boxProvider: CrisLayoutBox,
    @Inject('itemProvider') public itemProvider: Item
  ) {
    super(translateService, boxProvider, itemProvider);
  }

  ngOnInit() {
    super.ngOnInit();
    this.manifestUrl = environment.rest.baseUrl + '/iiif/' + this.item.id + '/manifest';
  }

  openMiradorViewer() {
    this.router.navigate(['../iiif-viewer'], { relativeTo: this.route });
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
