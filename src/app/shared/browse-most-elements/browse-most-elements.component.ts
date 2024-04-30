import { LayoutModeEnum, TopSection, TopSectionTemplateType } from '../../core/layout/models/section.model';
import { Component, inject, Input, OnInit } from '@angular/core';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { Context } from '../../core/shared/context.model';
import { ViewMode } from '../../core/shared/view-mode.model';
import { Router } from '@angular/router';

@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html'
})

export class BrowseMostElementsComponent implements OnInit {

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  protected readonly router = inject(Router);

  /**
   * The type of the template to render
   */
  templateTypeEnum = TopSectionTemplateType;

  sectionTemplateType: TopSectionTemplateType;

  ngOnInit(): void {
    this.sectionTemplateType = this.topSection?.template ?? TopSectionTemplateType.DEFAULT;
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
