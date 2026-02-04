/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */

import { inject, Injectable } from '@angular/core';
import {
  map,
  Observable,
  of,
} from 'rxjs';

import { MenuItemType } from '../menu-item-type.model';
import {
  AbstractMenuProvider,
  PartialMenuSection,
} from '../menu-provider.model';
import { APP_CONFIG } from '../../../../config/app-config.interface';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';

/**
 * Menu provider to create the "Communities & Collections" menu section in the admin navbar
 */
@Injectable()
export class AdminCommunityListMenuProvider extends AbstractMenuProvider {

  protected appConfig = inject(APP_CONFIG);
  protected authorizationService = inject(AuthorizationDataService);

  public getSections(): Observable<PartialMenuSection[]> {
    if (this.appConfig.layout.navbar.showCommunityCollection) {
      return of([]);
    }
    return this.authorizationService.isAuthorized(FeatureID.IsComColAdmin).pipe(
      map(isComColAdmin => {
        return [{
          visible: isComColAdmin,
          model: {
            type: MenuItemType.LINK,
            text: `menu.section.communities_and_collections`,
            link: `/community-list`,
          },
          icon: 'users',
        },
        ] as PartialMenuSection[];
      }));
  }
}
