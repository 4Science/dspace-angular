import { NgIf } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbButtonsModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import {
  SortDirection,
  SortOptions,
} from '../../../../core/cache/models/sort-options.model';
import {
  LayoutModeEnum,
  TopSection,
} from './../../../../core/layout/models/section.model';
import { Context } from '../../../../core/shared/context.model';
import { ThemedBrowseMostElementsComponent } from '../../../browse-most-elements/themed-browse-most-elements.component';
import { PaginationComponentOptions } from '../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../../search/models/paginated-search-options.model';

/**
 * Component representing the Top component section.
 */
@Component({
  selector: 'ds-base-top-section',
  templateUrl: './top-section.component.html',
  standalone: true,
  imports: [
    ThemedBrowseMostElementsComponent,
    NgIf,
    TranslateModule,
    FormsModule,
    NgbButtonsModule,
  ],
})
export class TopSectionComponent implements OnInit {

  @Input()
    sectionId: string;

  @Input()
    topSection: TopSection;

  @Input()
    context: Context = Context.BrowseMostElements;

  paginatedSearchOptions: PaginatedSearchOptions;

  showThumbnails: boolean;

  layoutMode: LayoutModeEnum = LayoutModeEnum.CARD;

  ngOnInit() {
    const order = this.topSection.order;
    const numberOfItems = this.topSection.numberOfItems;
    const sortDirection = order && order.toUpperCase() === 'ASC' ? SortDirection.ASC : SortDirection.DESC;
    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: 'search-object-pagination',
      pageSize: numberOfItems,
      currentPage: 1,
    });
    this.layoutMode = this.topSection.defaultLayoutMode;
    this.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: this.topSection.discoveryConfigurationName,
      pagination: pagination,
      sort: new SortOptions(this.topSection.sortField, sortDirection),
    });
  }
}
