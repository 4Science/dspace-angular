import { Context } from './../../../core/shared/context.model';
import { ThemedComponent } from './../../../shared/theme-support/themed.component';
import { TopSection, LayoutModeEnum } from './../../../core/layout/models/section.model';
import { PaginatedSearchOptions } from './../../search/models/paginated-search-options.model';
import { DefaultBrowseElementsComponent } from './default-browse-elements.component';
import { Component, Input } from '@angular/core';

/**
 * Themed component for the DefaultBrowseElementsComponent.
 */
@Component({
  selector: 'ds-themed-default-browse-elements',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
})
export class ThemedDefaultBrowseElementsComponent extends ThemedComponent<DefaultBrowseElementsComponent> {

  @Input() context: Context;

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() showMetrics;

  @Input() showThumbnails;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;

  protected inAndOutputNames: (keyof DefaultBrowseElementsComponent & keyof this)[] = ['context', 'paginatedSearchOptions', 'showMetrics', 'showThumbnails', 'topSection', 'mode'];

  protected getComponentName(): string {
    return 'DefaultBrowseElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`./../../../../themes/${themeName}/app/browse-most-elements/default-browse-elements/default-browse-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./default-browse-elements.component`);
  }
}
