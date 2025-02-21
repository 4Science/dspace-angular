import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { hasValue } from '@dspace/shared/utils';
import { Observable } from 'rxjs';
import {
  first,
  map,
} from 'rxjs/operators';

import { RemoteData } from '@dspace/core';
import { Collection } from '@dspace/core';
import { HALLink } from '@dspace/core';
import {
  getFirstSucceededRemoteData,
  getRemoteDataPayload,
} from '@dspace/core';
import { ComcolRoleComponent } from '../../../shared/comcol/comcol-forms/edit-comcol-page/comcol-role/comcol-role.component';

/**
 * Component for managing a collection's roles
 */
@Component({
  selector: 'ds-collection-roles',
  templateUrl: './collection-roles.component.html',
  imports: [
    ComcolRoleComponent,
    AsyncPipe,
  ],
  standalone: true,
})
export class CollectionRolesComponent implements OnInit {

  dsoRD$: Observable<RemoteData<Collection>>;

  /**
   * The different roles for the collection, as an observable.
   */
  comcolRoles$: Observable<HALLink[]>;

  /**
   * The collection to manage, as an observable.
   */
  collection$: Observable<Collection>;

  constructor(
    protected route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.dsoRD$ = this.route.parent.data.pipe(
      first(),
      map((data) => data.dso),
    );

    this.collection$ = this.dsoRD$.pipe(
      getFirstSucceededRemoteData(),
      getRemoteDataPayload(),
    );

    this.comcolRoles$ = this.collection$.pipe(
      map((collection) => {
        let workflowGroups: HALLink[] | HALLink = hasValue(collection._links.workflowGroups) ? collection._links.workflowGroups : [];
        if (!Array.isArray(workflowGroups)) {
          workflowGroups = [workflowGroups];
        }
        return [
          {
            name: 'collection-admin',
            href: collection._links.adminGroup.href,
          },
          {
            name: 'submitters',
            href: collection._links.submittersGroup.href,
          },
          {
            name: 'item_read',
            href: collection._links.itemReadGroup.href,
          },
          {
            name: 'bitstream_read',
            href: collection._links.bitstreamReadGroup.href,
          },
          ...workflowGroups,
        ];
      }),
    );
  }
}
