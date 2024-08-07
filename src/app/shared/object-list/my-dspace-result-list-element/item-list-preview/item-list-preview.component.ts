import {
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { Context } from 'src/app/core/shared/context.model';
import { WorkflowItem } from 'src/app/core/submission/models/workflowitem.model';

import {
  APP_CONFIG,
  AppConfig,
} from '../../../../../config/app-config.interface';
import { environment } from '../../../../../environments/environment';
import { DSONameService } from '../../../../core/breadcrumbs/dso-name.service';
import { Item } from '../../../../core/shared/item.model';
import { DuplicateMatchMetadataDetailConfig } from '../../../../submission/sections/detect-duplicate/models/duplicate-detail-metadata.model';
import { fadeInOut } from '../../../animations/fade';
import { SearchResult } from '../../../search/models/search-result.model';

/**
 * This component show metadata for the given item object in the list view.
 */
@Component({
  selector: 'ds-item-list-preview',
  styleUrls: ['item-list-preview.component.scss'],
  templateUrl: 'item-list-preview.component.html',
  animations: [fadeInOut],
})
export class ItemListPreviewComponent implements OnInit {

  /**
   * The item to display
   */
  @Input() item: Item;

  /**
   * The search result object
   */
  @Input() object: SearchResult<any>;

  /**
   * Represents the badge context
   */
  @Input() badgeContext: Context;

  /**
   * A boolean representing if to show submitter information
   */
  @Input() showSubmitter = false;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails;

  /**
   * An object representing the duplicate match
   */
  @Input() metadataList: DuplicateMatchMetadataDetailConfig[] = [];

  /**
   * Represents the workflow of the item
   */
  @Input() workflowItem: WorkflowItem;

  dsoTitle: string;

  authorMetadata = environment.searchResult.authorMetadata;

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    public dsoNameService: DSONameService,
  ) {
  }

  ngOnInit(): void {
    this.showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    this.dsoTitle = this.dsoNameService.getHitHighlights(this.object, this.item);
  }

}
