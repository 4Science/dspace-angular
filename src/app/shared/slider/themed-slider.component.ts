import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../theme-support/themed.component';
import { SliderComponent } from './slider.component';
import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';
import { SliderSection } from '../../core/layout/models/section.model';

/**
 * Themed wrapper for SliderComponent
 */
@Component({
  selector: 'ds-themed-slider',
  styleUrls: [],
  templateUrl: '../theme-support/themed.component.html',
})
export class ThemedSliderComponent extends ThemedComponent<SliderComponent> {

  @Input() items: ItemSearchResult[];
  @Input() sliderSection: SliderSection;

  protected inAndOutputNames: (keyof SliderComponent & keyof this)[] = ['items', 'sliderSection'];

  protected getComponentName(): string {
    return 'SliderComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/slider/slider.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./slider.component`);
  }
}
