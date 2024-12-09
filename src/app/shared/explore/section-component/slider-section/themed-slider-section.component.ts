import { ThemedComponent } from '../../../theme-support/themed.component';
import { Component, Input } from '@angular/core';
import { SliderSection } from '../../../../core/layout/models/section.model';
import { SliderSectionComponent } from './slider-section.component';

@Component({
  selector: 'ds-themed-slider-section',
  templateUrl: '../../../theme-support/themed.component.html',
})
export class ThemedSliderSectionComponent extends ThemedComponent<SliderSectionComponent> {

  @Input() sectionId: string;
  @Input() sliderSection: SliderSection;

  protected inAndOutputNames: (keyof SliderSectionComponent & keyof this)[] = ['sectionId', 'sliderSection'];

  protected getComponentName(): string {
    return 'SliderSectionComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../../themes/${themeName}/app/shared/explore/section-component/slider-section/slider-section.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./slider-section.component`);
  }

}
