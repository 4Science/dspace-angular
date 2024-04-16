import { AdvancedTopSection } from './../../../core/layout/models/section.model';
import { Component, Input } from '@angular/core';
import { ImageBrowseElementsComponent } from '../image-browse-elements/image-browse-elements.component';

@Component({
  selector: 'ds-card-browse-elements',
  templateUrl: './card-browse-elements.component.html',
  styleUrls: ['./card-browse-elements.component.scss']
})
export class CardBrowseElementsComponent extends ImageBrowseElementsComponent {

  @Input() advancedTopSection: AdvancedTopSection;

}
