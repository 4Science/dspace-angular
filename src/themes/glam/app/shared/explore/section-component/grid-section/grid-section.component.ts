import { Component } from '@angular/core';

import { getItemPageRoute } from '../../../../../../../app/item-page/item-page-routing-paths';
import { GridSectionComponent as BaseComponent } from '../../../../../../../app/shared/explore/section-component/grid-section/grid-section.component';


@Component({
  selector: 'ds-themed-grid-section',
  styleUrls: ['./grid-section.component.scss'],
  templateUrl: './grid-section.component.html',
  standalone: true,
})
export class GridSectionComponent extends BaseComponent {
  /**
   * to get the route of the item
   * @param item
   * @returns route to the item as a string
   */
  getItemPageRoute(item) {
    return getItemPageRoute(item);
  }
}
