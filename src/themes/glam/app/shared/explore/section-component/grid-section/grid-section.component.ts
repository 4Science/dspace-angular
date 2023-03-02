import { Component } from '@angular/core';
import {
  GridSectionComponent as BaseComponent
} from '../../../../../../../app/shared/explore/section-component/grid-section/grid-section.component';
import { getItemPageRoute } from '../../../../../../../app/item-page/item-page-routing-paths';


@Component({
  selector: 'ds-grid-section',
  styleUrls: ['./grid-section.component.scss'],
  templateUrl: './grid-section.component.html'
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
