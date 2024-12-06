import { Component, Input } from '@angular/core';

import { SliderSection } from '../../../../core/layout/models/section.model';

/**
 * Component representing the Slider component section.
 */
@Component({
    selector: 'ds-slider-section',
    templateUrl: './slider-section.component.html',
    styleUrls: ['./slider-section.component.scss'],
})
export class SliderSectionComponent {
  /**
   * The id of the current section.
   */
  @Input() sectionId: string;

  /**
   * Carousel section configurations.
   */
  @Input() sliderSection: SliderSection;

}
