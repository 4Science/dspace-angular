import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Context } from 'vm';

import {
  LayoutModeEnum,
  TopSection,
} from '../../core/layout/models/section.model';
import { PaginatedSearchOptions } from '../search/models/paginated-search-options.model';
import { ThemedComponent } from '../theme-support/themed.component';
import { BrowseMostElementsComponent } from './browse-most-elements.component';

/**
 * Themed wrapper for BrowseMostElementsComponent
 */
@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: [],
  templateUrl: '../theme-support/themed.component.html',
  standalone: true,
  imports: [BrowseMostElementsComponent],
})
export class ThemedBrowseMostElementsComponent extends ThemedComponent<BrowseMostElementsComponent> {

  @Input() context: Context;

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() projection: string;

  @Input() mode: LayoutModeEnum;

  @Input() discoveryConfigurationsTotalElementsMap: Map<string, number>;

  @Input() showLabel: boolean;

  @Input() showMetrics: boolean;

  @Input() topSection: TopSection;

  @Input() showThumbnails: boolean;

  @Output() totalElements: EventEmitter<number> = new EventEmitter<number>();

  protected inAndOutputNames: (keyof BrowseMostElementsComponent & keyof this)[] = ['context', 'paginatedSearchOptions', 'projection', 'mode', 'showLabel', 'showMetrics', 'showThumbnails', 'topSection', 'discoveryConfigurationsTotalElementsMap'];

  protected getComponentName(): string {
    return 'BrowseMostElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/shared/browse-most-elements/browse-most-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./browse-most-elements.component`);
  }
}
