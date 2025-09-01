import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { filter, map, shareReplay } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { AuthMethod } from '../../core/auth/models/auth.method';
import {
  getAuthenticationError,
  getAuthenticationMethods,
  isAuthenticated,
  isAuthenticationLoading
} from '../../core/auth/selectors';
import { getForgotPasswordRoute, getRegisterRoute } from '../../app-routing-paths';
import { hasValue } from '../empty.util';
import { AuthService } from '../../core/auth/auth.service';
import { CoreState } from '../../core/core-state.model';
import { rendersAuthMethodType } from './methods/log-in.methods-decorator';
import { AuthMethodType } from '../../core/auth/models/auth.method-type';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { ActivatedRoute } from '@angular/router';
import uniqBy from 'lodash/uniqBy';
import { environment } from '../../../environments/environment';
import { combineLatestWith, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'ds-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogInComponent implements OnInit, OnDestroy {

  /**
   * A boolean representing if LogInComponent is in a standalone page
   * @type {boolean}
   */
  @Input() isStandalonePage: boolean;

  /**
   * Method to exclude from the list of authentication methods
   */
  @Input() excludedAuthMethod: AuthMethodType;
  /**
   *  Weather or not to show the register link
   */
  @Input() showRegisterLink = true;

  /**
   * The list of authentication methods available
   * @type {AuthMethod[]}
   */
  public authMethods: Observable<AuthMethod[]>;

  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated: Observable<boolean>;

  /**
   * True if the authentication is loading.
   * @type {boolean}
   */
  public loading: Observable<boolean>;

  /**
   * Whether or not the current user (or anonymous) is authorized to register an account
   */
  canRegister$: Observable<boolean>;

  /**
   * Whether or not the current user (or anonymous) is authorized to register an account
   */
  canForgot$: Observable<boolean>;

  /**
   * Shows the divider only if contains at least one link to show
   */
  canShowDivider$: Observable<boolean>;

  /**
   * Track subscription to unsubscribe on destroy
   * @private
   */
  private authErrorSubscription: Subscription;

  constructor(private store: Store<CoreState>,
              private authService: AuthService,
              private route: ActivatedRoute,
              protected authorizationService: AuthorizationDataService
  ) {
  }

  ngOnInit(): void {
    this.authMethods = this.store.pipe(
      select(getAuthenticationMethods),
      combineLatestWith(
        this.route.data.pipe(
          filter(routeData => !!routeData),
          map(data => data.isBackDoor),
        )),
      map(([methods, isBackdoor]) => this.filterAndSortAuthMethods(methods, isBackdoor, environment.auth.disableStandardLogin)),
      // ignore the ip authentication method when it's returned by the backend
      map((authMethods: AuthMethod[]) => uniqBy(authMethods.filter(a => a.authMethodType !== AuthMethodType.Ip), 'authMethodType'))
    );

    // set loading
    this.loading = this.store.pipe(select(isAuthenticationLoading));

    // set isAuthenticated
    this.isAuthenticated = this.store.pipe(select(isAuthenticated));

    // Clear the redirect URL if an authentication error occurs and this is not a standalone page
    this.authErrorSubscription = this.store.pipe(select(getAuthenticationError)).subscribe((error) => {
      if (hasValue(error) && !this.isStandalonePage) {
        this.authService.clearRedirectUrl();
      }
    });

    this.canRegister$ = this.authorizationService.isAuthorized(FeatureID.EPersonRegistration);

    this.canForgot$ = this.authorizationService.isAuthorized(FeatureID.EPersonForgotPassword).pipe(shareReplay(1));
    this.canShowDivider$ = this.canRegister$.pipe(
      combineLatestWith(this.canForgot$),
      map(([canRegister, canForgot]) => (canRegister || canForgot) && (!environment.auth.disableStandardLogin || this.isStandalonePage)),
      filter(Boolean)
    );
  }

  filterAndSortAuthMethods(authMethods: AuthMethod[], isBackdoor: boolean, isStandardLoginDisabled = false): AuthMethod[] {
    return authMethods.filter((authMethod: AuthMethod) => {
        const methodComparison = (authM) => {
          if (isBackdoor) {
            return authM.authMethodType === AuthMethodType.Password;
          }
          if (!isStandardLoginDisabled) {
            return authM.authMethodType !== AuthMethodType.Password;
          }
          return true;

        };
        return methodComparison(authMethod) &&
          authMethod.authMethodType !== this.excludedAuthMethod &&
          rendersAuthMethodType(authMethod.authMethodType) !== undefined;
      },
    ).sort((method1: AuthMethod, method2: AuthMethod) => method1.position - method2.position);
  }

  getRegisterRoute() {
    return getRegisterRoute();
  }

  getForgotRoute() {
    return getForgotPasswordRoute();
  }

  ngOnDestroy(): void {
    if (hasValue(this.authErrorSubscription)) {
      this.authErrorSubscription.unsubscribe();
    }
  }
}
