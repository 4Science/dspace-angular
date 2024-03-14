import {
  LayoutModeEnum,
  TemplateType,
  TopSection,
} from '../../core/layout/models/section.model';
import { Component, Input } from '@angular/core';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { Context } from '../../core/shared/context.model';

@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html'
})

export class BrowseMostElementsComponent {

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

  templateType = TemplateType;
}
