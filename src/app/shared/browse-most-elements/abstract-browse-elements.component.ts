import { CollectionElementLinkType } from '../object-collection/collection-element-link.type';
import { Router } from '@angular/router';
import { LayoutModeEnum, TopSection } from '../../core/layout/models/section.model';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output, PLATFORM_ID } from '@angular/core';
import { SearchService } from '../../core/shared/search/search.service';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { SearchResult } from '../search/models/search-result.model';
import { Context } from '../../core/shared/context.model';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { APP_CONFIG } from '../../../config/app-config.interface';


@Component({
  template: ''
})
export abstract class AbstractBrowseElementsComponent {

  protected readonly appConfig = inject(APP_CONFIG);
  protected readonly platformId = inject(PLATFORM_ID);
  protected readonly searchService = inject(SearchService);
  protected readonly router = inject(Router);
  protected readonly cdr = inject(ChangeDetectorRef);

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;

  @Output() totalElements: EventEmitter<number> = new EventEmitter<number>();

  searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  public cardLayoutMode = LayoutModeEnum.CARD;

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

}
