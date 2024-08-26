import { ViewMode } from '../../core/shared/view-mode.model';
import { Router } from '@angular/router';
import { LayoutModeEnum, TopSection, TopSectionTemplateType, } from '../../core/layout/models/section.model';
import { ChangeDetectorRef, Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID } from '@angular/core';

import { SearchManager } from '../../core/browse/search-manager';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { Context } from '../../core/shared/context.model';
import { BehaviorSubject } from 'rxjs';
import { AppConfig, APP_CONFIG } from 'src/config/app-config.interface';

@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html'
})

export class BrowseMostElementsComponent implements OnInit, OnChanges {

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  @Input() discoveryConfigurationsTotalElementsMap: Map<string, number>;

  /**
   * The type of the template to render
   */
  templateTypeEnum = TopSectionTemplateType;

  sectionTemplateType: TopSectionTemplateType;

  paginatedSearchOptionsBS = new BehaviorSubject<PaginatedSearchOptions>(null);

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    @Inject(PLATFORM_ID) private platformId: Object,
    private searchService: SearchManager,
    private router: Router,
    private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    this.sectionTemplateType = this.topSection?.template ?? TopSectionTemplateType.DEFAULT;
  }

  ngOnChanges() { // trigger change detection on child components
    this.paginatedSearchOptionsBS.next(this.paginatedSearchOptions);
  }

  showAllResults() {
    const viewMode: ViewMode =
      this.sectionTemplateType === TopSectionTemplateType.DEFAULT && this.topSection.defaultLayoutMode === LayoutModeEnum.LIST ?
        ViewMode.ListElement : ViewMode.GridElement;

    void this.router.navigate(['/search'], {
      queryParams: {
        configuration: this.paginatedSearchOptions.configuration,
        view: viewMode,
      },
      replaceUrl: true,
    });
  }

}
