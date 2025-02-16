import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';
import {
  mergeMap,
  take,
  tap,
} from 'rxjs/operators';

import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { RemoteData } from '../../../core/data/remote-data';
import { ResearcherProfile } from '../../../core/profile/model/researcher-profile.model';
import { ResearcherProfileDataService } from '../../../core/profile/researcher-profile-data.service';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { DSpaceObjectType } from '../../../core/shared/dspace-object-type.model';
import { getFirstSucceededRemoteData } from '../../../core/shared/operators';
import { isNotUndefined } from '../../empty.util';
import { NotificationsService } from '../../notifications/notifications.service';
import { ContextMenuEntryComponent } from '../context-menu-entry.component';
import { ContextMenuEntryType } from '../context-menu-entry-type';

@Component({
  selector: 'ds-context-menu-claim-item',
  templateUrl: './claim-item-menu.component.html',
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
  ],
})
export class ClaimItemMenuComponent extends ContextMenuEntryComponent implements OnInit {

  public claimable$: BehaviorSubject<boolean> =  new BehaviorSubject<boolean>(false);
  public isProcessing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Initialize instance variables
   *
   * @param {DSpaceObject} injectedContextMenuObject
   * @param {DSpaceObjectType} injectedContextMenuObjectType
   * @param {AuthorizationDataService} authorizationService
   * @param {ResearcherProfileService} researcherProfileService
   * @param {NotificationsService} notificationsService
   * @param {TranslateService} translate
   */
  constructor(
    @Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    @Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    protected authorizationService: AuthorizationDataService,
    private researcherProfileService: ResearcherProfileDataService,
    private notificationsService: NotificationsService,
    private translate: TranslateService,
  ) {
    super(injectedContextMenuObject, injectedContextMenuObjectType, ContextMenuEntryType.Claim);
  }

  ngOnInit() {
    this.authorizationService.isAuthorized(FeatureID.ShowClaimItem, this.contextMenuObject.self).pipe(
      take(1),
    ).subscribe((isAuthorized: boolean) => (this.claimable$.next(isAuthorized)));
  }

  claim() {
    this.isProcessing$.next(true);

    this.authorizationService.isAuthorized(FeatureID.CanClaimItem, this.contextMenuObject.self).pipe(
      take(1),
    ).subscribe((isAuthorized: boolean) => {
      if (!isAuthorized) {
        this.notificationsService.warning(this.translate.get('researcherprofile.claim.not-authorized'));
        this.isProcessing$.next(false);
      } else {
        this.createFromExternalSource();
      }
    });

  }

  createFromExternalSource() {
    this.researcherProfileService.createFromExternalSource(this.injectedContextMenuObject.self).pipe(
      tap((rd: any) => {
        if (!rd.hasSucceeded) {
          this.isProcessing$.next(false);
        }
      }),
      getFirstSucceededRemoteData(),
      mergeMap((rd: RemoteData<ResearcherProfile>) => {
        return this.researcherProfileService.findRelatedItemId(rd.payload);
      }))
      .subscribe((id: string) => {
        if (isNotUndefined(id)) {
          this.notificationsService.success(this.translate.get('researcherprofile.success.claim.title'),
            this.translate.get('researcherprofile.success.claim.body'));
          this.claimable$.next(false);
          this.isProcessing$.next(false);
          this.notificationsService.claimedProfile.next(true);
          this.notifyChangesInContextMenu.next(true);
        } else {
          this.notificationsService.error(
            this.translate.get('researcherprofile.error.claim.title'),
            this.translate.get('researcherprofile.error.claim.body'));
        }
      });
  }

  isClaimable(): Observable<boolean> {
    return this.claimable$;
  }
}
