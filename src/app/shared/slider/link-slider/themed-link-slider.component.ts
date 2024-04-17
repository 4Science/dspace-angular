import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../../theme-support/themed.component';
import { LinkSliderComponent } from './link-slider.component';

/**
 * Themed wrapper for LinkSliderComponent
 */
@Component({
  selector: 'ds-themed-link-slider',
  styleUrls: [],
  templateUrl: './../../theme-support/themed.component.html',
})
export class ThemedLinkSliderComponent extends ThemedComponent<LinkSliderComponent> {

  @Input() discoveryConfiguration!: string;

  @Input() numberOfItems = 4;

  @Input() sortOrder = 'desc';

  @Input() sortField = 'lastModified';

  protected inAndOutputNames: (keyof LinkSliderComponent & keyof this)[] = ['discoveryConfiguration', 'numberOfItems', 'sortOrder', 'sortField'];

  protected getComponentName(): string {
    return 'LinkSliderComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../themes/${themeName}/app/slider/link-slider.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./link-slider.component`);
  }
}
