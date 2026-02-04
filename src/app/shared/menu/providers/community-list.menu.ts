/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { inject, Injectable } from '@angular/core';
import {
  Observable,
  of,
} from 'rxjs';

import { MenuItemType } from '../menu-item-type.model';
import {
  AbstractMenuProvider,
  PartialMenuSection,
} from '../menu-provider.model';
import { APP_CONFIG } from '../../../../config/app-config.interface';

/**
 * Menu provider to create the "Communities & Collections" menu section in the public navbar
 */
@Injectable()
export class CommunityListMenuProvider extends AbstractMenuProvider {

  protected appConfig = inject(APP_CONFIG);
  public getSections(): Observable<PartialMenuSection[]> {
    if (!this.appConfig.layout.navbar.showCommunityCollection) {
      return of([]);
    }

    return of([
      {
        visible: true,
        model: {
          type: MenuItemType.LINK,
          text: `menu.section.communities_and_collections`,
          link: `/community-list`,
        },
        icon: 'diagram-project',
      },
    ] as PartialMenuSection[]);
  }
}
