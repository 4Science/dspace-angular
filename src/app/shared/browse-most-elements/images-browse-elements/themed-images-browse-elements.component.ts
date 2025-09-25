import {
  Component,
  Input,
} from '@angular/core';

import { TopSection } from '../../../core/layout/models/section.model';
import { Context } from '../../../core/shared/context.model';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import { ThemedComponent } from '../../theme-support/themed.component';
import { ImagesBrowseElementsComponent } from './images-browse-elements.component';

/**
 * This component is a wrapper for the ImagesBrowseElementsComponent
 */
@Component({
  selector: 'ds-images-browse-elements',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
  standalone: true,
  imports: [ImagesBrowseElementsComponent],
})
export class ThemedImagesBrowseElementsComponent extends ThemedComponent<ImagesBrowseElementsComponent> {

  // AbstractBrowseElementsComponent I/O variables

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  protected inAndOutputNames: (keyof ImagesBrowseElementsComponent & keyof this)[] = ['paginatedSearchOptions', 'context', 'topSection'];

  protected getComponentName(): string {
    return 'ImagesBrowseElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`./../../../../themes/${themeName}/app/shared/browse-most-elements/images-browse-elements/images-browse-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./images-browse-elements.component`);
  }
}
