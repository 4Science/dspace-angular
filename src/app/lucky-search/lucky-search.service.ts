import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SearchManager } from '../core/browse/search-manager';
import { PaginatedList } from '../core/data/paginated-list.model';
import { RemoteData } from '../core/data/remote-data';
import { DSpaceObject } from '../core/shared/dspace-object.model';
import { PaginatedSearchOptions } from '../shared/search/models/paginated-search-options.model';
import { SearchResult } from '../shared/search/models/search-result.model';

@Injectable({
  providedIn: 'root',
})
export class LuckySearchService {

  constructor(private searchService: SearchManager) {
  }

  /**
   * @returns {string} The base path to the search page
   */
  getSearchLink(): string {
    return 'lucky-search';
  }

  sendRequest(paginatedSearchOptions: PaginatedSearchOptions): Observable<RemoteData<PaginatedList<SearchResult<DSpaceObject>>>> {
    const paginatedSearchOptionsNew = Object.assign(new PaginatedSearchOptions({}), paginatedSearchOptions, {
      configuration: this.getSearchLink(),
    });
    return this.searchService.search(paginatedSearchOptionsNew);
  }
}
