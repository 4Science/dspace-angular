import { isPlatformServer } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {  Router } from '@angular/router';
import isEqual from 'lodash/isEqual';

import {
  APP_CONFIG,
  AppConfig,
} from '../../../config/app-config.interface';
import { SearchManager } from '../../core/browse/search-manager';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import {
  LayoutModeEnum,
  TopSection,
} from '../../core/layout/models/section.model';
import { Context } from '../../core/shared/context.model';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { ViewMode } from '../../core/shared/view-mode.model';
import { CollectionElementLinkType } from '../object-collection/collection-element-link.type';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { SearchResult } from '../search/models/search-result.model';
import { followLink } from '../utils/follow-link-config.model';

@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html',
})

export class BrowseMostElementsComponent implements OnInit {

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

  searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  public cardLayoutMode = LayoutModeEnum.CARD;

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    @Inject(PLATFORM_ID) private platformId: any,
    private searchService: SearchManager,
    private router: Router,
    private cdr: ChangeDetectorRef) {

  }

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    const followLinks = showThumbnails ? [followLink('thumbnail')] : [];
    this.searchService.search(this.paginatedSearchOptions, null, true, true, ...followLinks).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((response: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
      this.searchResults = response as any;
      this.cdr.detectChanges();
    });
  }

  async showAllResults() {
    const view = isEqual(this.mode, LayoutModeEnum.LIST)
      ? ViewMode.ListElement
      : ViewMode.GridElement;
    await this.router.navigate(['/search'], {
      queryParams: {
        configuration: this.paginatedSearchOptions.configuration,
        view: view,
      },
      replaceUrl: true,
    });
  }
}
