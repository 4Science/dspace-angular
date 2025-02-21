import { Component } from '@angular/core';

import { PaginatedList } from '@dspace/core';
import { SearchResult } from '@dspace/core';
import { AbstractTabulatableElementComponent } from '../../../object-collection/shared/objects-collection-tabulatable/objects-collection-tabulatable.component';

@Component({
  selector: 'ds-search-result-table-element',
  template: ``,
  standalone: true,
})
/**
 * Component that describes the implementations and interfaces needed from any extension of this class to be used in search results for visualization in ViewMode.Table
 */
export class TabulatableResultListElementsComponent<T extends PaginatedList<K>, K extends SearchResult<any>> extends AbstractTabulatableElementComponent<T> {}
