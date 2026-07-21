import { AsyncPipe } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import {
  map,
  startWith,
} from 'rxjs/operators';

import { getDSORoute } from '../../../app-routing-paths';
import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { RemoteData } from '../../../core/data/remote-data';
import { ConfigurationProperty } from '../../../core/shared/configuration-property.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { URLCombiner } from '../../../core/url-combiner/url-combiner';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { ContextMenuEntryType } from '../context-menu-entry-type';

/**
 * This component renders a context menu option that provides to export an item.
 */
@Component({
  selector: 'ds-context-menu-audit-item',
  templateUrl: './audit-item-menu.component.html',
  imports: [
    AsyncPipe,
    RouterLink,
    TranslateModule,
  ],
})
export class AuditItemMenuComponent extends ContextMenuEntryComponent implements OnInit {

  public showMenuItem$: Observable<boolean>;

  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    private authorizationService: AuthorizationDataService,
    private configurationDataService: ConfigurationDataService,
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType, ContextMenuEntryType.Audit);
  }

  ngOnInit(): void {

    const isEnabled$ = this.configurationDataService.findByPropertyName('audit.enabled').pipe(
      getFirstCompletedRemoteData(),
      map((response: RemoteData<ConfigurationProperty>) => this.isPropertyEnabled(response)),
    );

    const isAuthorized$ = combineLatest(
      [
        this.authorizationService.isAuthorized(FeatureID.AdministratorOf),
        this.authorizationService.isAuthorized(FeatureID.IsCollectionAdmin),
        this.authorizationService.isAuthorized(FeatureID.IsCommunityAdmin),
      ],
    ).pipe(
      map(([isAdmin, isCollectionAdmin, isCommunityAdmin]) => isAdmin || isCollectionAdmin || isCommunityAdmin),
    );

    this.showMenuItem$ = combineLatest([isEnabled$, isAuthorized$]).pipe(
      map(([isEnabled, isAuthorized]) => isAuthorized && isEnabled),
      startWith(false),
    );
  }

  get link() {
    return new URLCombiner(getDSORoute(this.contextMenuObject), 'auditlogs').toString();
  }

  private isPropertyEnabled(property:  RemoteData<ConfigurationProperty>): boolean {
    return property.hasSucceeded ? (property.payload.values.length > 0 && property.payload.values[0] === 'true') : false;
  }

}
