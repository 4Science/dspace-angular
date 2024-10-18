import { Component, Inject, OnInit } from '@angular/core';

import { rendersContextMenuEntriesForType } from '../context-menu.decorator';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { ContextMenuEntryType } from '../context-menu-entry-type';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { take } from 'rxjs/operators';
import { SiteAuthorizationService } from '../../../core/data/feature-authorization/site-authorization.service';

/**
 * This component renders a context menu option that provides to export an item.
 */
@Component({
  selector: 'ds-context-menu-audit-item',
  templateUrl: './audit-item-menu.component.html'
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class AuditItemMenuComponent extends ContextMenuEntryComponent implements OnInit {

  public isAuthorized: BehaviorSubject<boolean> =  new BehaviorSubject<boolean>(false);

  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    private siteAuthorizationService: SiteAuthorizationService
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType, ContextMenuEntryType.Audit);
  }

  ngOnInit(): void {
    combineLatest(
      [
        this.siteAuthorizationService.getSiteAuthorization(FeatureID.AdministratorOf),
        this.siteAuthorizationService.getSiteAuthorization(FeatureID.IsCollectionAdmin),
        this.siteAuthorizationService.getSiteAuthorization(FeatureID.IsCommunityAdmin),
      ]
    ).pipe(
      take(1)
    ).subscribe(([isAdmin, isCollectionAdmin, isCommunityAdmin]) => {
      this.isAuthorized.next(isAdmin || isCommunityAdmin || isCollectionAdmin);
    });
  }
}
