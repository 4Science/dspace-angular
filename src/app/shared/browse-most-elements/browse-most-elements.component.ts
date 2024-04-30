import {
  AdvancedTopSection,
  LayoutModeEnum,
  TopSectionTemplateType,
  TopSection,
} from '../../core/layout/models/section.model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { Context } from '../../core/shared/context.model';

@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html'
})

export class BrowseMostElementsComponent implements OnInit {

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics: boolean;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails: boolean;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;


  /**
   * The type of the template to render
   */
  templateTypeEnum = TopSectionTemplateType;

  sectionTemplateType: TopSectionTemplateType;

  ngOnInit(): void {
    this.sectionTemplateType = this.topSection?.template ?? TopSectionTemplateType.DEFAULT;
  }
}
