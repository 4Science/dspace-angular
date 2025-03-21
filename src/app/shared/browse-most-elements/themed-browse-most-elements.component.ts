import {
  Component,
  Input,
} from '@angular/core';
import { Context } from 'vm';

import { TopSection } from '../../core/layout/models/section.model';
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

  @Input() showLabel: boolean;

  @Input() showMetrics: boolean;

  @Input() showThumbnails: boolean;

  @Input() topSection: TopSection;

  protected inAndOutputNames: (keyof BrowseMostElementsComponent & keyof this)[] = ['context', 'paginatedSearchOptions', 'projection', 'showLabel', 'showMetrics', 'showThumbnails', 'topSection'];

  protected getComponentName(): string {
    return 'BrowseMostElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/browse-most-elements/browse-most-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./browse-most-elements.component`);
  }
}
