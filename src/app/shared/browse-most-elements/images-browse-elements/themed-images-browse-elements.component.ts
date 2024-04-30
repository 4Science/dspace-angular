import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../../theme-support/themed.component';
import { ImagesBrowseElementsComponent } from './images-browse-elements.component';
import { Context } from '../../../core/shared/context.model';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import { LayoutModeEnum, TopSection } from '../../../core/layout/models/section.model';

/**
 * This component is a wrapper for the ImagesBrowseElementsComponent
 */
@Component({
  selector: 'ds-themed-images-browse-elements',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
})
export class ThemedImagesBrowseElementsComponent extends ThemedComponent<ImagesBrowseElementsComponent> {

  @Input() context: Context;

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() showMetrics;

  @Input() showThumbnails;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;

  protected inAndOutputNames: (keyof ImagesBrowseElementsComponent & keyof this)[] = ['context', 'paginatedSearchOptions', 'showMetrics', 'showThumbnails', 'topSection', 'mode'];

  protected getComponentName(): string {
    return 'ImagesBrowseElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`./../../../../themes/${themeName}/app/browse-most-elements/images-browse-elements/images-browse-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./images-browse-elements.component`);
  }
}
