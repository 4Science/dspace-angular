import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { ItemStatusComponent as BaseComponent } from '../../../../../../app/item-page/edit-item-page/item-status/item-status.component';
import {
  fadeIn,
  fadeInOut,
} from '../../../../../../app/shared/animations/fade';

@Component({
  selector: 'ds-item-status',
  // templateUrl: './item-status.component.html',
  templateUrl: '../../../../../../app/item-page/edit-item-page/item-status/item-status.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  animations: [
    fadeIn,
    fadeInOut,
  ],
})
export class ItemStatusComponent extends BaseComponent {
}
