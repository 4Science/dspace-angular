import { Component, Inject, Input } from '@angular/core';
import { Bitstream } from '../../../../../../../../core/shared/bitstream.model';
import { environment } from '../../../../../../../../../environments/environment';
import {
  AdvancedAttachmentElementType,
  AdvancedAttachmentPreviewButtonConfig,
  AdvancedAttachmentPreviewButtonTypes
} from '../../../../../../../../../config/advanced-attachment-rendering.config';
import { BitstreamRenderingModelComponent } from '../../bitstream-rendering-model';
import { LayoutField } from '../../../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../../../core/shared/item.model';
import { BitstreamDataService } from '../../../../../../../../core/data/bitstream-data.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ds-bitstream-attachment',
  templateUrl: './bitstream-attachment.component.html',
  styleUrls: ['./bitstream-attachment.component.scss']
})
export class BitstreamAttachmentComponent extends BitstreamRenderingModelComponent {

  /**
   * Environment variables configuring the fields to be viewed
   */
  envMetadata = environment.advancedAttachmentRendering.metadata;

  /**
   * Environment variables configuring the buttons and when to show them
   */
  envButtons = environment.advancedAttachmentRendering.buttons;

  /**
   * Configuration type enum
   */
  AdvancedAttachmentElementType = AdvancedAttachmentElementType;

  /**
   * Configuration type enum
   */
  AdvancedAttachmentButtonTypes = AdvancedAttachmentPreviewButtonTypes;

  @Input()
  attachment: Bitstream;

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    protected readonly bitstreamDataService: BitstreamDataService,
    protected readonly translateService: TranslateService,
    protected readonly router: Router,
    protected readonly route: ActivatedRoute,
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, bitstreamDataService, translateService);
  }

  public isVisible(attachment: Bitstream, buttonConfig: AdvancedAttachmentPreviewButtonConfig): boolean {
    const found = attachment.hasMetadata(buttonConfig.metadata, buttonConfig.metadataValueFilter);
    return buttonConfig.negation ? !found : found;
  }

  public openPdfViewer() {
    this.router.navigate([`../viewer/${this.attachment.id}/pdf`], { relativeTo: this.route });
  }
}
