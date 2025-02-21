import { NgClass } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';

import { ItemSearchResult } from '@dspace/core';
import { Context } from '@dspace/core';
import { Item } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { ItemActionsComponent } from '../../../mydspace-actions/item/item-actions.component';
import { listableObjectComponent } from '../../../object-collection/shared/listable-object/listable-object.decorator';
import { SearchResultListElementComponent } from '../../search-result-list-element/search-result-list-element.component';
import { ThemedItemListPreviewComponent } from '../item-list-preview/themed-item-list-preview.component';

/**
 * This component renders item object for the search result in the list view for submission.
 */
@Component({
  selector: 'ds-item-search-result-list-element-submission',
  styleUrls: ['../../search-result-list-element/search-result-list-element.component.scss', './item-search-result-list-element-submission.component.scss'],
  templateUrl: './item-search-result-list-element-submission.component.html',
  standalone: true,
  imports: [ThemedItemListPreviewComponent, NgClass, ItemActionsComponent],
})

@listableObjectComponent(ItemSearchResult, ViewMode.ListElement, Context.Workspace)
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement, Context.Workflow)
export class ItemSearchResultListElementSubmissionComponent extends SearchResultListElementComponent<ItemSearchResult, Item> implements OnInit {
  /**
   * Represents the badge context
   */
  public badgeContext = Context.MyDSpaceArchived;


  /**
   * Display thumbnails if required by configuration
   */
  showThumbnails: boolean;

  ngOnInit() {
    super.ngOnInit();
    this.showThumbnails = this.appConfig.browseBy.showThumbnails;
  }
}
