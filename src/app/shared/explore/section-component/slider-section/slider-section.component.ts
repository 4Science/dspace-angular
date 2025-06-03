import {
  Component,
  Input,
} from '@angular/core';

import { SliderSection } from '../../../../core/layout/models/section.model';
import { ThemedLinkSliderComponent } from '../../../slider/link-slider/themed-link-slider.component';

/**
 * Component representing the Slider component section.
 */
@Component({
  selector: 'ds-base-slider-section',
  templateUrl: './slider-section.component.html',
  styleUrls: ['./slider-section.component.scss'],
  standalone: true,
  imports: [
    ThemedLinkSliderComponent,
  ],
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
