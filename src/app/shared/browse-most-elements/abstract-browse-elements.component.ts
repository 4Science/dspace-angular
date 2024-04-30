import { CollectionElementLinkType } from '../object-collection/collection-element-link.type';
import { LayoutModeEnum, TopSection } from '../../core/layout/models/section.model';
import { ChangeDetectorRef, Component, inject, Input, PLATFORM_ID } from '@angular/core';
import { SearchService } from '../../core/shared/search/search.service';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { SearchResult } from '../search/models/search-result.model';
import { Context } from '../../core/shared/context.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { APP_CONFIG } from '../../../config/app-config.interface';
import { isPlatformServer } from '@angular/common';
import { followLink } from '../utils/follow-link-config.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';


@Component({ template: '' })
export abstract class AbstractBrowseElementsComponent {

  protected readonly appConfig = inject(APP_CONFIG);
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly searchService = inject(SearchService);
  protected readonly cdr = inject(ChangeDetectorRef);

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  public cardLayoutMode = LayoutModeEnum.CARD;

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

  protected getAllBitstreams(showThumbnails = false) {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const followLinks = showThumbnails ? [followLink('thumbnail')] : [];
    this.searchService.search(this.paginatedSearchOptions, null, true, true, ...followLinks).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((response: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
      this.searchResults = response;
      this.cdr.detectChanges();
    });
  }

}
