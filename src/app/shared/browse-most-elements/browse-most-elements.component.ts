import {LayoutModeEnum, TopSection, TopSectionTemplateType} from '../../core/layout/models/section.model';
import {Component, inject, Input, OnChanges, OnInit} from '@angular/core';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { Context } from '../../core/shared/context.model';
import { BehaviorSubject } from 'rxjs';
import isEqual from 'lodash/isEqual';
import {ViewMode} from '../../core/shared/view-mode.model';
import {Router} from '@angular/router';

@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html'
})

export class BrowseMostElementsComponent implements OnInit, OnChanges {
  private readonly router = inject(Router);

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  showLabel: boolean;

  showMetrics = true;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;

  paginatedSearchOptionsBS = new BehaviorSubject<PaginatedSearchOptions>(null);

  sectionTemplateType: TopSectionTemplateType;

  /**
   * The type of the template to render
   */
  templateTypeEnum = TopSectionTemplateType;

  ngOnInit(): void {
    this.sectionTemplateType = this.topSection?.template
      ?? (this.mode === LayoutModeEnum.CARD ? TopSectionTemplateType.CARD : TopSectionTemplateType.DEFAULT);
  }

  ngOnChanges() { // trigger change detection on child components
    this.paginatedSearchOptionsBS.next(this.paginatedSearchOptions);
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
