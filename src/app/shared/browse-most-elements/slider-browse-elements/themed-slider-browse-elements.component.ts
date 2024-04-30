import { AdvancedTopSection } from '../../../core/layout/models/section.model';
import { PaginatedSearchOptions } from '../../search/models/paginated-search-options.model';
import { Context } from '../../../core/shared/context.model';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThemedComponent } from '../../theme-support/themed.component';
import { SliderBrowseElementsComponent } from './slider-browse-elements.component';

/**
 * Themed component for the SliderBrowseElementsComponent
 */
@Component({
  selector: 'ds-themed-slider-browse-elements',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
})
export class ThemedSliderBrowseElementsComponent extends ThemedComponent<SliderBrowseElementsComponent> {

  @Input() context: Context;

  @Input() paginatedSearchOptions: PaginatedSearchOptions;

  @Input() showThumbnails: boolean;

  @Input() advancedTopSection: AdvancedTopSection;

  @Output() totalElements: EventEmitter<number> = new EventEmitter<number>();

  protected inAndOutputNames: (keyof SliderBrowseElementsComponent & keyof this)[] = ['context', 'paginatedSearchOptions', 'showThumbnails', 'advancedTopSection'];

  protected getComponentName(): string {
    return 'SliderBrowseElementsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`./../../../../themes/${themeName}/app/browse-most-elements/slider-browse-elements/slider-browse-elements.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./slider-browse-elements.component`);
  }
}
