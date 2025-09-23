import {
  AsyncPipe,
  LowerCasePipe,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';
import {
  Router,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import isEqual from 'lodash/isEqual';
import { BehaviorSubject } from 'rxjs';

import {
  LayoutModeEnum,
  TopSection,
  TopSectionTemplateType,
} from '../../core/layout/models/section.model';
import { Context } from '../../core/shared/context.model';
import { ViewMode } from '../../core/shared/view-mode.model';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { ThemedCardsBrowseElementsComponent } from './cards-browse-elements/themed-cards-browse-elements.component';
import { ThemedDefaultBrowseElementsComponent } from './default-browse-elements/themed-default-browse-elements.component';
import { ThemedImagesBrowseElementsComponent } from './images-browse-elements/themed-images-browse-elements.component';
import { ThemedSliderBrowseElementsComponent } from './slider-browse-elements/themed-slider-browse-elements.component';

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
    ThemedCardsBrowseElementsComponent,
    NgSwitchCase,
    NgIf,
    ThemedSliderBrowseElementsComponent,
    ThemedImagesBrowseElementsComponent,
    RouterLink,
  ],
})

export class BrowseMostElementsComponent implements OnInit, OnChanges {

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
  @Input() projection;

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

  @Input() discoveryConfigurationsTotalElementsMap: Map<string, number> = new Map();


  paginatedSearchOptions$ = new BehaviorSubject<PaginatedSearchOptions>(null);

  sectionTemplateType: TopSectionTemplateType;

  /**
   * The type of the template to render
   */
  templateTypeEnum = TopSectionTemplateType;

  searchQueryParams = {};

  ngOnInit(): void {
    this.sectionTemplateType = this.topSection?.template
      ?? (this.mode === LayoutModeEnum.CARD ? TopSectionTemplateType.CARD : TopSectionTemplateType.DEFAULT);
    this.searchQueryParams = {
      configuration: this.paginatedSearchOptions?.configuration,
      view: isEqual(this.topSection.defaultLayoutMode, LayoutModeEnum.LIST)
        ? ViewMode.ListElement
        : ViewMode.GridElement,
    };
  }

  ngOnChanges() { // trigger change detection on child components
    this.paginatedSearchOptions$.next(this.paginatedSearchOptions);
  }
}
