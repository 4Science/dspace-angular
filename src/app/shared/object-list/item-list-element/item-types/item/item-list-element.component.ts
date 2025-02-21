import {
  Component,
  OnChanges,
} from '@angular/core';
import { hasValue } from '@dspace/shared/utils';

import { ItemSearchResult } from '@dspace/core';
import { Item } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { listableObjectComponent } from '../../../../object-collection/shared/listable-object/listable-object.decorator';
import { ListableObjectComponentLoaderComponent } from '../../../../object-collection/shared/listable-object/listable-object-component-loader.component';
import { AbstractListableElementComponent } from '../../../../object-collection/shared/object-collection-element/abstract-listable-element.component';

@listableObjectComponent('Publication', ViewMode.ListElement)
@listableObjectComponent(Item, ViewMode.ListElement)
@Component({
  selector: 'ds-item-list-element',
  styleUrls: ['./item-list-element.component.scss'],
  templateUrl: './item-list-element.component.html',
  standalone: true,
  imports: [
    ListableObjectComponentLoaderComponent,
  ],
})
/**
 * The component for displaying a list element for an item of the type Publication
 */
export class ItemListElementComponent extends AbstractListableElementComponent<Item> implements OnChanges {

  itemSearchResult: ItemSearchResult;

  ngOnChanges(): void {
    if (hasValue(this.object)) {
      this.itemSearchResult = Object.assign(new ItemSearchResult(), {
        indexableObject: this.object,
      });
    }
  }

}
