import { Injectable } from '@angular/core';
import {
  Observable,
  of,
} from 'rxjs';

import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { Item } from '../../../core/shared/item.model';
import { MenuItemType } from '../menu-item-type.model';
import { PartialMenuSection } from '../menu-provider.model';
import { DSpaceObjectPageMenuProvider } from './helper-providers/dso.menu';

/**
 * Menu provider to create the item-specific statistics option in the public statistics menu.
 */
@Injectable()
export class ItemStatisticsMenuProvider extends DSpaceObjectPageMenuProvider {

  public getSectionsForContext(dso: DSpaceObject): Observable<PartialMenuSection[]> {
    return of([
      {
        id: `statistics_item_:${dso.id}`,
        active: true,
        visible: true,
        parentID: 'statistics',
        model: {
          type: MenuItemType.LINK,
          text: 'menu.section.statistics.item',
          link: `/statistics/items/${dso.id}/`,
        },
      },
    ]);
  }

  protected isApplicable(dso: DSpaceObject): boolean {
    return dso instanceof Item;
  }
}

