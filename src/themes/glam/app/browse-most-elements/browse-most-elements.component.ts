import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { SearchService } from '../../../../app/core/shared/search/search.service';
import { DSpaceObject } from '../../../../app/core/shared/dspace-object.model';
import { Context } from '../../../../app/core/shared/context.model';
import { RemoteData } from '../../../../app/core/data/remote-data';
import { PaginatedList } from '../../../../app/core/data/paginated-list.model';
import { getFirstCompletedRemoteData } from '../../../../app/core/shared/operators';
import { TopSection, LayoutModeEnum } from '../../../../app/core/layout/models/section.model';
import { CollectionElementLinkType } from '../../../../app/shared/object-collection/collection-element-link.type';
import { PaginatedSearchOptions } from '../../../../app/shared/search/models/paginated-search-options.model';
import { SearchResult } from '../../../../app/shared/search/models/search-result.model';
import { followLink } from '../../../../app/shared/utils/follow-link-config.model';
import { getItemPageRoute } from '../../../../app/item-page/item-page-routing-paths';

@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html',
})
export class BrowseMostElementsComponent implements OnInit {
  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;

  searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  public cardLayoutMode = LayoutModeEnum.CARD;

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

  constructor(
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
  ) {
    /* */
  }

  ngOnInit() {
    this.getSearchResults();
  }

  private getSearchResults() {
    this.searchService
      .search(this.paginatedSearchOptions, null, true, true, followLink('thumbnail'))
      .pipe(getFirstCompletedRemoteData())
      .subscribe(
        (response: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
          this.searchResults = response as any;
          this.cdr.detectChanges();
        }
      );
  }

  getItemPageRoute(item) {
    return getItemPageRoute(item);
  }

}
