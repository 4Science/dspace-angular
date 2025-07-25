import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import {
  map,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
import { RemoteData } from '../../core/data/remote-data';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { ResearcherProfile } from '../../core/profile/model/researcher-profile.model';
import { ResearcherProfileDataService } from '../../core/profile/researcher-profile-data.service';
import { NoContent } from '../../core/shared/NoContent.model';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteDataPayload,
} from '../../core/shared/operators';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';
import { isNotEmpty } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import {
  SwitchColor,
  SwitchComponent,
  SwitchOption,
} from '../../shared/switch/switch.component';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { VarDirective } from '../../shared/utils/var.directive';
import { ProfileClaimService } from '../profile-claim/profile-claim.service';
import { ProfileClaimItemModalComponent } from '../profile-claim-item-modal/profile-claim-item-modal.component';

@Component({
  selector: 'ds-profile-page-researcher-form',
  templateUrl: './profile-page-researcher-form.component.html',
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
    VarDirective,
    BtnDisabledDirective,
    SwitchComponent,
  ],
  standalone: true,
})
/**
 * Component for a user to create/delete or change their researcher profile.
 */
export class ProfilePageResearcherFormComponent implements OnInit {

  /**
   * The user to display the form for.
   */
  @Input() user: EPerson;

  /**
   * The researcher profile to show.
   */
  researcherProfile$: BehaviorSubject<ResearcherProfile> = new BehaviorSubject<ResearcherProfile>(null);

  /**
   * A boolean representing if a delete operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  processingDelete$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * A boolean representing if a create delete operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  processingCreate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * If exists The uuid of the item associated to the researcher profile
   */
  researcherProfileItemId: string;

  /**
   * The custom options for the 'ds-switch' component
   */
  switchOptions: SwitchOption[] = [
    { value: 'public', icon: 'fa fa-globe', labelColor: SwitchColor.Success, label: 'researcher.profile.public.visibility', iconColor: SwitchColor.Success },
    { value: 'private', icon: 'fa fa-lock', labelColor: SwitchColor.Danger, label: 'researcher.profile.private.visibility', iconColor: SwitchColor.Danger },
  ];

  constructor(protected researcherProfileService: ResearcherProfileDataService,
              protected profileClaimService: ProfileClaimService,
              protected translationService: TranslateService,
              protected notificationService: NotificationsService,
              protected authService: AuthService,
              protected router: Router,
              protected modalService: NgbModal) {

  }

  /**
   * Initialize the component searching the current user researcher profile.
   */
  ngOnInit(): void {
    // Retrieve researcherProfile if exists
    this.initResearchProfile();
  }

  /**
   * Create a new profile for the current user.
   */
  createProfile(): void {
    this.processingCreate$.next(true);

    this.authService.getAuthenticatedUserFromStore().pipe(
      take(1),
      switchMap((currentUser) => this.profileClaimService.hasProfilesToSuggest(currentUser)))
      .subscribe((hasProfilesToSuggest) => {

        if (hasProfilesToSuggest) {
          this.processingCreate$.next(false);
          const modal = this.modalService.open(ProfileClaimItemModalComponent);
          modal.componentInstance.dso = this.user;
          modal.componentInstance.create.pipe(take(1)).subscribe(() => {
            this.createProfileFromScratch();
          });
        } else {
          this.createProfileFromScratch();
        }

      });
  }

  /**
   * Navigate to the items section to show the profile item details.
   *
   * @param researcherProfile the current researcher profile
   */
  viewProfile(researcherProfile: ResearcherProfile): void {
    if (this.researcherProfileItemId != null) {
      this.router.navigate(['items', this.researcherProfileItemId]);
    }
  }

  /**
   * Delete the given researcher profile.
   *
   * @param researcherProfile the profile to delete
   */
  deleteProfile(researcherProfile: ResearcherProfile): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.headerLabel = 'confirmation-modal.delete-profile.header';
    modalRef.componentInstance.infoLabel = 'confirmation-modal.delete-profile.info';
    modalRef.componentInstance.cancelLabel = 'confirmation-modal.delete-profile.cancel';
    modalRef.componentInstance.confirmLabel = 'confirmation-modal.delete-profile.confirm';
    modalRef.componentInstance.brandColor = 'danger';
    modalRef.componentInstance.confirmIcon = 'fas fa-trash';
    modalRef.componentInstance.response.pipe(take(1)).subscribe((confirm: boolean) => {
      if (confirm) {
        this.processingDelete$.next(true);
        this.researcherProfileService.delete(researcherProfile.id).pipe(
          getFirstCompletedRemoteData(),
          map((response: RemoteData<NoContent>) => response.isSuccess),
        ).subscribe((deleted) => {
          if (deleted) {
            this.researcherProfile$.next(null);
            this.researcherProfileItemId = null;
          }
          this.processingDelete$.next(false);
        });
      }
    });
  }

  /**
   * Toggle the visibility of the given researcher profile.
   *
   * @param researcherProfile the profile to update
   */
  toggleProfileVisibility(researcherProfile: ResearcherProfile): void {
    this.researcherProfileService.setVisibility(researcherProfile, !researcherProfile.visible).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((rd: RemoteData<ResearcherProfile>) => {
      if (rd.hasSucceeded) {
        this.researcherProfile$.next(rd.payload);
      } else {
        this.notificationService.error(null, this.translationService.get('researcher.profile.change-visibility.fail'));
      }
    });
  }

  /**
   * Create a new profile related to the current user from scratch.
   */
  createProfileFromScratch() {
    this.processingCreate$.next(true);
    this.researcherProfileService.create().pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((remoteData) => {
      this.processingCreate$.next(false);
      if (remoteData.isSuccess) {
        this.initResearchProfile();
        this.notificationService.success(null, this.translationService.get('researcher.profile.create.success'));
      } else {
        this.notificationService.error(null, this.translationService.get('researcher.profile.create.fail'));
      }
    });
  }

  /**
   * Initializes the researcherProfile and researcherProfileItemId attributes using the profile of the current user.
   */
  private initResearchProfile(): void {
    this.researcherProfileService.findById(this.user.id, false, true, followLink('item')).pipe(
      getFirstSucceededRemoteDataPayload(),
      tap((researcherProfile) => this.researcherProfile$.next(researcherProfile)),
      mergeMap((researcherProfile) => this.researcherProfileService.findRelatedItemId(researcherProfile)),
    ).subscribe((itemId: string) => {
      if (isNotEmpty(itemId)) {
        this.researcherProfileItemId = itemId;
      }
    });
  }

}
