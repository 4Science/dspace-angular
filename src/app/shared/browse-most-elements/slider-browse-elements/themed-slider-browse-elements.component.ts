import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import { Context } from '../../../core/shared/context.model';
import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../../theme-support/themed.component';
import { SliderBrowseElementsComponent } from './slider-browse-elements.component';
import { TopSection } from '../../../core/layout/models/section.model';

/**
 * Themed component for the SliderBrowseElementsComponent
 */
@Component({
  selector: 'ds-themed-slider-browse-elements',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
})
export class ThemedSliderBrowseElementsComponent extends ThemedComponent<SliderBrowseElementsComponent> {

  // AbstractBrowseElementsComponent I/O variables

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() context: Context;

  @Input() topSection: TopSection;

  protected inAndOutputNames: (keyof SliderBrowseElementsComponent & keyof this)[] = ['paginatedSearchOptions', 'context', 'topSection'];

  protected getComponentName(): string {
    return 'SliderBrowseElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`./../../../../themes/${themeName}/app/shared/browse-most-elements/slider-browse-elements/slider-browse-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./slider-browse-elements.component`);
  }
}
