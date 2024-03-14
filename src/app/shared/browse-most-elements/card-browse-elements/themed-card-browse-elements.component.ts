import { LayoutModeEnum } from './../../../core/layout/models/section.model';
import { PaginatedSearchOptions } from './../../search/models/paginated-search-options.model';
import { Context } from './../../../core/shared/context.model';
import { Component, Input } from '@angular/core';
import { TopSection } from '../../../core/layout/models/section.model';
import { ThemedComponent } from '../../theme-support/themed.component';
import { CardBrowseElementsComponent } from './card-browse-elements.component';

/**
 * Themed component for the CardBrowseElementsComponent
 */
@Component({
  selector: 'ds-themed-card-browse-elements',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
})
export class ThemedCardBrowseElementsComponent extends ThemedComponent<CardBrowseElementsComponent> {

  @Input() context: Context;

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() showMetrics;

  @Input() showThumbnails;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;

  protected inAndOutputNames: (keyof CardBrowseElementsComponent & keyof this)[] = ['context', 'paginatedSearchOptions', 'showMetrics', 'showThumbnails', 'topSection', 'mode'];

  protected getComponentName(): string {
    return 'CardBrowseElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`./../../../../themes/${themeName}/app/browse-most-elements/card-browse-elements/card-browse-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./card-browse-elements.component`);
  }
}
