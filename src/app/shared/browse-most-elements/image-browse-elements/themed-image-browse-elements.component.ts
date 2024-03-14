import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../../theme-support/themed.component';
import { ImageBrowseElementsComponent } from './image-browse-elements.component';
import { Context } from '../../../core/shared/context.model';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import { LayoutModeEnum, TopSection } from '../../../core/layout/models/section.model';

/**
 * This component is a wrapper for the ImageBrowseElementsComponent
 */
@Component({
  selector: 'ds-themed-image-browse-elements',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
})
export class ThemedImageBrowseElementsComponent extends ThemedComponent<ImageBrowseElementsComponent> {

  @Input() context: Context;

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() showMetrics;

  @Input() showThumbnails;

  @Input() topSection: TopSection;

  @Input() mode: LayoutModeEnum;

  protected inAndOutputNames: (keyof ImageBrowseElementsComponent & keyof this)[] = ['context', 'paginatedSearchOptions', 'showMetrics', 'showThumbnails', 'topSection', 'mode'];

  protected getComponentName(): string {
    return 'ImageBrowseElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`./../../../../themes/${themeName}/app/browse-most-elements/image-browse-elements/image-browse-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./image-browse-elements.component`);
  }
}
