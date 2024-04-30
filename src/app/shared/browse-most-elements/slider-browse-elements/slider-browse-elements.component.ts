import { AdvancedTopSection } from '../../../core/layout/models/section.model';
import { Component, Input } from '@angular/core';
import { ImageBrowseElementsComponent } from '../image-browse-elements/image-browse-elements.component';

@Component({
  selector: 'ds-slider-browse-elements',
  templateUrl: './slider-browse-elements.component.html',
  styleUrls: ['./slider-browse-elements.component.scss']
})
export class SliderBrowseElementsComponent extends ImageBrowseElementsComponent {

  @Input() advancedTopSection: AdvancedTopSection;

}
