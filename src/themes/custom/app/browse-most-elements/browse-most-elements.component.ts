import {
  AsyncPipe,
  LowerCasePipe,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BrowseMostElementsComponent as BaseComponent } from '../../../../app/shared/browse-most-elements/browse-most-elements.component';
import { ThemedCardsBrowseElementsComponent } from '../../../../app/shared/browse-most-elements/cards-browse-elements/themed-cards-browse-elements.component';
import { ThemedDefaultBrowseElementsComponent } from '../../../../app/shared/browse-most-elements/default-browse-elements/themed-default-browse-elements.component';
import { ThemedImagesBrowseElementsComponent } from '../../../../app/shared/browse-most-elements/images-browse-elements/themed-images-browse-elements.component';
import { ThemedSliderBrowseElementsComponent } from '../../../../app/shared/browse-most-elements/slider-browse-elements/themed-slider-browse-elements.component';

/**
 * Component representing the breadcrumbs of a page
 */
@Component({
  selector: 'ds-base-browse-most-elements',
  // templateUrl: './breadcrumbs.component.html',
  templateUrl: '../../../../app/shared/browse-most-elements/browse-most-elements.component.html',
  // styleUrls: ['./breadcrumbs.component.scss']
  styleUrls: ['../../../../app/shared/browse-most-elements/browse-most-elements.component.scss'],
  standalone: true,
  imports: [
    ThemedDefaultBrowseElementsComponent,
    AsyncPipe,
    LowerCasePipe,
    NgSwitch,
    NgSwitchDefault,
    TranslateModule,
    ThemedCardsBrowseElementsComponent,
    NgSwitchCase,
    NgIf,
    ThemedSliderBrowseElementsComponent,
    ThemedImagesBrowseElementsComponent,
  ],
})
export class BrowseMostElementsComponent extends BaseComponent {
}
