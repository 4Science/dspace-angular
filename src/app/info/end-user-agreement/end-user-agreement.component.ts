import { NgIf } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { Store } from '@ngrx/store';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  combineLatest,
  of as observableOf,
  Subscription,
} from 'rxjs';
import {
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { AppState } from '../../app.reducer';
import {
  LogOutAction,
  RefreshEpersonAndTokenRedirectAction,
} from '../../core/auth/auth.actions';
import { AuthService } from '../../core/auth/auth.service';
import { EndUserAgreementService } from '../../core/end-user-agreement/end-user-agreement.service';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';
import { isNotEmpty } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { EndUserAgreementContentComponent } from './end-user-agreement-content/end-user-agreement-content.component';

@Component({
  selector: 'ds-base-end-user-agreement',
  templateUrl: './end-user-agreement.component.html',
  styleUrls: ['./end-user-agreement.component.scss'],
  standalone: true,
  imports: [EndUserAgreementContentComponent, FormsModule, TranslateModule, NgIf, BtnDisabledDirective],
})
/**
 * Component displaying the End User Agreement and an option to accept it
 */
export class EndUserAgreementComponent implements OnInit, OnDestroy {

  /**
   * Whether or not the user agreement has been accepted
   */
  accepted = false;
  /**
   * Whether or not the user agreement has already been accepted
   */
  alreadyAccepted = false;

  private subscription: Subscription = new Subscription();

  constructor(protected endUserAgreementService: EndUserAgreementService,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected authService: AuthService,
              protected store: Store<AppState>,
              protected router: Router,
              protected route: ActivatedRoute) {
  }

  /**
   * Initialize the component
   */
  ngOnInit(): void {
    this.initAccepted();
  }

  /**
   * Initialize the "accepted" property of this component by checking if the current user has accepted it before
   * If no user is logged in, should not show the form
   */
  initAccepted() {
    this.subscription.add(
      combineLatest([
        this.endUserAgreementService.hasCurrentUserOrCookieAcceptedAgreement(false),
        this.authService.isAuthenticated(),
      ])
        .subscribe(([accepted, authorized]) => {
          if (authorized) {

            if (!accepted) {
              this.notificationsService.warning(this.translate.instant('info.end-user-agreement.accept.warning'), {});
            }
            this.accepted = accepted;
            this.alreadyAccepted = accepted;

          } else {
            this.alreadyAccepted = true;
          }
        }),
    );
  }

  /**
   * Submit the form
   * Set the End User Agreement, display a notification and (optionally) redirect the user back to their original destination
   */
  submit() {
    this.endUserAgreementService.setUserAcceptedAgreement(this.accepted).pipe(
      switchMap((success) => {
        if (success) {
          this.notificationsService.success(this.translate.instant('info.end-user-agreement.accept.success'));
          return this.route.queryParams.pipe(map((params) => params.redirect));
        } else {
          this.notificationsService.error(this.translate.instant('info.end-user-agreement.accept.error'));
          return observableOf(undefined);
        }
      }),
      take(1),
    ).subscribe((redirectUrl) => {
      if (isNotEmpty(redirectUrl)) {
        this.store.dispatch(new RefreshEpersonAndTokenRedirectAction(this.authService.getToken(), redirectUrl));
      }
    });
  }

  /**
   * Cancel the agreement
   * If the user is logged in, this will log them out
   * If the user is not logged in, they will be redirected to the homepage
   */
  cancel() {
    this.authService.isAuthenticated().pipe(take(1)).subscribe((authenticated) => {
      if (authenticated) {
        this.store.dispatch(new LogOutAction());
      } else {
        this.router.navigate(['home']);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
