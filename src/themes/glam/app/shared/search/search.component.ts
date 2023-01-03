import { Component } from '@angular/core';
import { SearchComponent as BaseComponent } from "../../../../../app/shared/search/search.component";

@Component({
  selector: 'ds-search',
  styleUrls: ['./search.component.scss'],
  templateUrl: './search.component.html'
})

/**
 * This component renders a sidebar, a search input bar and the search results.
 */
export class SearchComponent extends BaseComponent {}
