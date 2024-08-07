import { Component } from '@angular/core';

import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemSearchResultListElementComponent } from '../../../../../shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';

@listableObjectComponent('JournalIssueSearchResult', ViewMode.ListElement)
@Component({
  selector: 'ds-journal-issue-search-result-list-element',
  styleUrls: ['./journal-issue-search-result-list-element.component.scss'],
  templateUrl: './journal-issue-search-result-list-element.component.html',
})
/**
 * The component for displaying a list element for an item search result of the type Journal Issue
 */
export class JournalIssueSearchResultListElementComponent extends ItemSearchResultListElementComponent {

}
