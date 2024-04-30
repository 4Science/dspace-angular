import { AdvancedTopSection } from '../../../core/layout/models/section.model';
import { Component, Input } from '@angular/core';
import { ImagesBrowseElementsComponent } from '../images-browse-elements/images-browse-elements.component';

@Component({
  selector: 'ds-slider-browse-elements',
  templateUrl: './slider-browse-elements.component.html',
  styleUrls: ['./slider-browse-elements.component.scss']
})
export class SliderBrowseElementsComponent extends ImagesBrowseElementsComponent {

  @Input() advancedTopSection: AdvancedTopSection;

}
