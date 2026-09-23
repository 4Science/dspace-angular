import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item } from '../../../core/shared/item.model';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../object-collection/shared/listable-object/listable-object.decorator';
import { Context } from '../../../core/shared/context.model';
import { ItemSearchResult } from '../../object-collection/shared/item-search-result.model';
import { SearchResultListElementComponent } from '../search-result-list-element/search-result-list-element.component';

@Component({
  selector: 'ds-associateitems-list',
  templateUrl: './associateitems-list.component.html',
  styleUrls: ['./associateitems-list.component.scss']
})

@listableObjectComponent(ItemSearchResult, ViewMode.ListElement, Context.AssociateItem)
export class AssociateItemListComponent extends SearchResultListElementComponent<ItemSearchResult, Item> implements OnInit {


  /**
   * Emit custom event for listable object custom actions.
   */
  @Output() customEvent = new EventEmitter<any>();

  /**
   * Pass custom data to the component for custom utilization
   */
  @Input() customData: any;

  /**
   * Display thumbnails if required by configuration
   */
  showThumbnails: boolean;

  ngOnInit() {
    super.ngOnInit();
    this.showThumbnails = this.appConfig.browseBy.showThumbnails;
  }

}

