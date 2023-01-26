import { Component } from '@angular/core';
import { getItemPageRoute } from '../../../../app/item-page/item-page-routing-paths';
import { BrowseMostElementsComponent as BaseComponent } from '../../../../app/shared/browse-most-elements/browse-most-elements.component';


@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html',
})
export class BrowseMostElementsComponent extends BaseComponent {
/**
 * to get the route of the item
 * @param item
 * @returns route to the item as a string
 */
  getItemPageRoute(item) {
    return getItemPageRoute(item);
  }
}
