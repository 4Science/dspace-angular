import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../theme-support/themed.component';
import { SliderComponent } from './slider.component';

/**
 * Themed wrapper for SliderComponent
 */
@Component({
  selector: 'ds-themed-slider',
  styleUrls: [],
  templateUrl: '../theme-support/themed.component.html',
})
export class ThemedSliderComponent extends ThemedComponent<SliderComponent> {

  @Input() discoveryConfiguration!: string;

  @Input() numberOfItems = 4;

  @Input() sortOrder = 'desc';

  @Input() sortField = 'lastModified';

  protected inAndOutputNames: (keyof SliderComponent & keyof this)[] = ['discoveryConfiguration', 'numberOfItems', 'sortOrder', 'sortField'];

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
