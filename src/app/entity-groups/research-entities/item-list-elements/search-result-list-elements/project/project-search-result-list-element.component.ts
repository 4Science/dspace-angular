import { Component } from '@angular/core';

import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemSearchResultListElementComponent } from '../../../../../shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';

@listableObjectComponent('ProjectSearchResult', ViewMode.ListElement)
@Component({
  selector: 'ds-project-search-result-list-element',
  styleUrls: ['./project-search-result-list-element.component.scss'],
  templateUrl: './project-search-result-list-element.component.html',
})
/**
 * The component for displaying a list element for an item search result of the type Project
 */
export class ProjectSearchResultListElementComponent extends ItemSearchResultListElementComponent {

}
