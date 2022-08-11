import { ThemedComponent } from '../../../theme-support/themed.component';
import { Component, Input } from '@angular/core';
import { CarouselSection } from '../../../../core/layout/models/section.model';
import { CarouselSectionComponent } from './carousel-section.component';

@Component({
  selector: 'ds-themed-carousel-section',
  styleUrls: [],
  templateUrl: '../../../theme-support/themed.component.html',
})
export class ThemedCarouselSectionComponent extends ThemedComponent<CarouselSectionComponent> {

  @Input()
  sectionId: string;

  @Input()
  carouselSection: CarouselSection;

  protected inAndOutputNames: (keyof CarouselSectionComponent & keyof this)[] = ['sectionId', 'carouselSection'];

  protected getComponentName(): string {
    return 'CarouselSectionComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../../themes/${themeName}/app/shared/explore/section-component/carousel-section/carousel-section.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./carousel-section.component`);
  }

}
