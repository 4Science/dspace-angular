import { Component, Input } from '@angular/core';
import { ThemedComponent } from '../theme-support/themed.component';
import { CarouselWithThumbnailsComponent } from './carousel-with-thumbnails.component';
import { CarouselOptions } from '../carousel/carousel-options.model';
/**
 * Themed wrapper for CarouselWithThumbnailsComponent
 */
@Component({
  selector: 'ds-themed-carousel-with-thumbnails',
  styleUrls: [],
  templateUrl: '../theme-support/themed.component.html',
})
export class ThemedCarouselWithThumbnailsComponent extends ThemedComponent<CarouselWithThumbnailsComponent> {

  @Input() carouselOptions: CarouselOptions;

  @Input() scope: string;

  @Input() discoveryConfiguration: string;

  protected inAndOutputNames: (keyof CarouselWithThumbnailsComponent & keyof this)[] = ['scope', 'carouselOptions', 'discoveryConfiguration'];

  protected getComponentName(): string {
    return 'CarouselWithThumbnailsComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../themes/${themeName}/app/carousel-with-thumbnails/carousel-with-thumbnails.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./carousel-with-thumbnails.component`);
  }
}
