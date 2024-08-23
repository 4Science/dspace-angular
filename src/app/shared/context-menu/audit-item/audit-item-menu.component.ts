import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { rendersContextMenuEntriesForType } from '../context-menu.decorator';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { ContextMenuEntryType } from '../context-menu-entry-type';

/**
 * This component renders a context menu option that provides to export an item.
 */
@Component({
  selector: 'ds-context-menu-audit-item',
  templateUrl: './audit-item-menu.component.html',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    AsyncPipe,
    TranslateModule,
  ],
})
@rendersContextMenuEntriesForType(DSpaceObjectType.ITEM)
export class AuditItemMenuComponent extends ContextMenuEntryComponent implements OnInit {

  public isAdmin: BehaviorSubject<boolean> =  new BehaviorSubject<boolean>(false);

  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    private authorizationService: AuthorizationDataService,
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType, ContextMenuEntryType.Audit);
  }

  ngOnInit(): void {
    this.authorizationService.isAuthorized(FeatureID.AdministratorOf, undefined, undefined).pipe(
      take(1),
    ).subscribe((isAuthorized: boolean) => (this.isAdmin.next(isAuthorized)));
  }
}
