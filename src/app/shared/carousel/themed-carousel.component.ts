import {
  Component,
  Input,
} from '@angular/core';

import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';
import { ThemedComponent } from '../theme-support/themed.component';
import { CarouselComponent } from './carousel.component';
import { CarouselOptions } from './carousel-options.model';

/**
 * Themed wrapper for CarouselComponent
 */
@Component({
  selector: 'ds-carousel',
  styleUrls: [],
  templateUrl: '../theme-support/themed.component.html',
  standalone: true,
  imports: [CarouselComponent],
})
export class ThemedCarouselComponent extends ThemedComponent<CarouselComponent> {

  @Input() items: ItemSearchResult[];

  @Input() carouselOptions: CarouselOptions;

  protected inAndOutputNames: (keyof CarouselComponent & keyof this)[] = ['items', 'carouselOptions'];

  protected getComponentName(): string {
    return 'CarouselComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/carousel/carousel.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./carousel.component`);
  }
}
