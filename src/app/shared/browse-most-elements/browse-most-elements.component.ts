import {
  AdvancedTopSection,
  LayoutModeEnum,
  AdvancedTopSectionTemplateType,
  TopSection,
} from '../../core/layout/models/section.model';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  @Input() advancedTopSection: AdvancedTopSection;

  @Input() mode: LayoutModeEnum;

  /**
   * The total number of elements
   */
  @Output() totalElements: EventEmitter<number> = new EventEmitter<number>();

  /**
   * The type of the template to render
   */
  templateType = AdvancedTopSectionTemplateType;

  sectionTemplateType = AdvancedTopSectionTemplateType.DEFAULT;

  ngOnInit(): void {
    this.sectionTemplateType = this.advancedTopSection
                              ? this.advancedTopSection?.template : this.topSection
                              ? this.topSection?.template : AdvancedTopSectionTemplateType.DEFAULT;
  }
}
