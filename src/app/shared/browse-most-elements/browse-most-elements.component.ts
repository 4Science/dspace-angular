import { AsyncPipe, LowerCasePipe, NgSwitch, NgSwitchDefault, } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, inject, Input, OnChanges, OnInit, PLATFORM_ID, } from '@angular/core';
import { Router } from '@angular/router';
import isEqual from 'lodash/isEqual';
import { LayoutModeEnum, TopSection, TopSectionTemplateType } from '../../core/layout/models/section.model';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { Context } from '../../core/shared/context.model';
import { BehaviorSubject } from 'rxjs';
import { ViewMode } from '../../core/shared/view-mode.model';

import { APP_CONFIG, AppConfig, } from '../../../config/app-config.interface';
import { SearchManager } from '../../core/browse/search-manager';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { RemoteData } from '../../core/data/remote-data';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { CollectionElementLinkType } from '../object-collection/collection-element-link.type';
import {
  ThemedDefaultBrowseElementsComponent
} from './default-browse-elements/themed-default-browse-elements.component';
import { SearchResult } from '../search/models/search-result.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-base-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html',
  standalone: true,
  imports: [
    ThemedDefaultBrowseElementsComponent,
    AsyncPipe,
    LowerCasePipe,
    NgSwitch,
    NgSwitchDefault,
    TranslateModule,
  ],
})

export class BrowseMostElementsComponent implements OnInit, OnChanges {
  private readonly router = inject(Router);

  /**
   * The pagination options
   */
  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  /**
   * The context of listable object
   */
  @Input() context: Context;

  /**
   * Optional projection to use during the search
   */
  @Input() projection = 'preventMetadataSecurity';

  @Input() mode: LayoutModeEnum;

  /**
   * Whether to show the badge label or not
   */
  @Input() showLabel: boolean;

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics: boolean;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails: boolean;

  @Input() topSection: TopSection;

  searchResults: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>;

  public cardLayoutMode = LayoutModeEnum.CARD;

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

  paginatedSearchOptions$ = new BehaviorSubject<PaginatedSearchOptions>(null);

  sectionTemplateType: TopSectionTemplateType;

  /**
   * The type of the template to render
   */
  templateTypeEnum = TopSectionTemplateType;

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    @Inject(PLATFORM_ID) private platformId: any,
    private searchService: SearchManager,
    private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.sectionTemplateType = this.topSection?.template
      ?? (this.mode === LayoutModeEnum.CARD ? TopSectionTemplateType.CARD : TopSectionTemplateType.DEFAULT);
  }

  ngOnChanges() { // trigger change detection on child components
    this.paginatedSearchOptions$.next(this.paginatedSearchOptions);
  }

  async showAllResults() {
    const view = isEqual(this.topSection.defaultLayoutMode, LayoutModeEnum.LIST)
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
