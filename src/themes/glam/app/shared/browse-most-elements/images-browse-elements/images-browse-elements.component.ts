import { Component } from '@angular/core';

import { ImagesBrowseElementsComponent as BaseComponent } from  '../../../../../../app/shared/browse-most-elements/images-browse-elements/images-browse-elements.component';

@Component({
  selector: 'ds-themed-images-browse-elements',
  templateUrl: './images-browse-elements.component.html',
  styleUrls: ['./../../../../../../app/shared/browse-most-elements/images-browse-elements/images-browse-elements.component.scss'],
  standalone: true,
})
export class ImagesBrowseElementsComponent extends BaseComponent {

}
