import {
  InMemoryScrollingOptions,
  Route,
  RouterConfigOptions,
} from '@angular/router';

import { environment } from '../environments/environment';
import { NOTIFICATIONS_MODULE_PATH } from './admin/admin-routing-paths';
import {
  ACCESS_CONTROL_MODULE_PATH,
  ADMIN_MODULE_PATH,
  BITSTREAM_MODULE_PATH,
  BULK_IMPORT_PATH,
  EDIT_ITEM_PATH,
  ERROR_PAGE,
  FORBIDDEN_PATH,
  FORGOT_PASSWORD_PATH,
  HEALTH_PAGE_PATH,
  INFO_MODULE_PATH,
  INTERNAL_SERVER_ERROR,
  LEGACY_BITSTREAM_MODULE_PATH,
  PAGE_NOT_FOUND_PATH,
  PROFILE_MODULE_PATH,
  REGISTER_PATH,
  REQUEST_COPY_MODULE_PATH,
  WORKFLOW_ITEM_MODULE_PATH,
} from './app-routing-paths';
import { COLLECTION_MODULE_PATH } from './collection-page/collection-page-routing-paths';
import { COMMUNITY_MODULE_PATH } from './community-page/community-page-routing-paths';
import { authBlockingGuard } from './core/auth/auth-blocking.guard';
import { authenticatedGuard } from './core/auth/authenticated.guard';
import { groupAdministratorGuard } from './core/data/feature-authorization/feature-authorization-guard/group-administrator.guard';
import { siteAdministratorGuard } from './core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
import { siteRegisterGuard } from './core/data/feature-authorization/feature-authorization-guard/site-register.guard';
import { endUserAgreementCurrentUserGuard } from './core/end-user-agreement/end-user-agreement-current-user.guard';
import { reloadGuard } from './core/reload/reload.guard';
import { forgotPasswordCheckGuard } from './core/rest-property/forgot-password-check-guard.guard';
import { ServerCheckGuard } from './core/server-check/server-check.guard';
import { ThemedForbiddenComponent } from './forbidden/themed-forbidden.component';
import { homePageResolver } from './home-page/home-page.resolver';
import { ITEM_MODULE_PATH } from './item-page/item-page-routing-paths';
import { menuResolver } from './menuResolver';
import { provideSuggestionNotificationsState } from './notifications/provide-suggestion-notifications-state';
import { ThemedPageErrorComponent } from './page-error/themed-page-error.component';
import { ThemedPageInternalServerErrorComponent } from './page-internal-server-error/themed-page-internal-server-error.component';
import { ThemedPageNotFoundComponent } from './pagenotfound/themed-pagenotfound.component';
import { PROCESS_MODULE_PATH } from './process-page/process-page-routing.paths';
import { viewTrackerResolver } from './statistics/angulartics/dspace/view-tracker.resolver';
import { provideSubmissionState } from './submission/provide-submission-state';
import { SUGGESTION_MODULE_PATH } from './suggestions-page/suggestions-page-routing-paths';

export const APP_ROUTES: Route[] = [
  { path: INTERNAL_SERVER_ERROR, component: ThemedPageInternalServerErrorComponent, data: { title: INTERNAL_SERVER_ERROR } },
  { path: ERROR_PAGE, component: ThemedPageErrorComponent, data: { title: ERROR_PAGE }  },
  {
    path: '',
    canActivate: [authBlockingGuard],
    canActivateChild: [ServerCheckGuard],
    resolve: [menuResolver],
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      {
        path: 'reload/:rnd',
        component: ThemedPageNotFoundComponent,
        pathMatch: 'full',
        canActivate: [reloadGuard],
        data: {
          title: PAGE_NOT_FOUND_PATH,
        },
      },
      {
        path: 'home',
        loadChildren: () => import('./home-page/home-page-routes')
          .then((m) => m.ROUTES),
        data: {
          showBreadcrumbs: false,
          dsoPath: 'site',
        },
        providers: [provideSuggestionNotificationsState()],
        canActivate: [endUserAgreementCurrentUserGuard],
        resolve: {
          site: homePageResolver,
          tracking: viewTrackerResolver,
        },
      },
      {
        path: 'community-list',
        loadChildren: () => import('./community-list-page/community-list-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: 'id',
        loadChildren: () => import('./lookup-by-id/lookup-by-id-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: 'handle',
        loadChildren: () => import('./lookup-by-id/lookup-by-id-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: REGISTER_PATH,
        loadChildren: () => import('./register-page/register-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [siteRegisterGuard],
      },
      {
        path: FORGOT_PASSWORD_PATH,
        loadChildren: () => import('./forgot-password/forgot-password-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard, forgotPasswordCheckGuard],
      },
      {
        path: COMMUNITY_MODULE_PATH,
        loadChildren: () => import('./community-page/community-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: COLLECTION_MODULE_PATH,
        loadChildren: () => import('./collection-page/collection-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: ITEM_MODULE_PATH,
        loadChildren: () => import('./item-page/item-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: 'entities/:entity-type',
        loadChildren: () => import('./item-page/item-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: LEGACY_BITSTREAM_MODULE_PATH,
        loadChildren: () => import('./bitstream-page/bitstream-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: BITSTREAM_MODULE_PATH,
        loadChildren: () => import('./bitstream-page/bitstream-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: 'mydspace',
        loadChildren: () => import('./my-dspace-page/my-dspace-page-routes')
          .then((m) => m.ROUTES),
        providers: [provideSuggestionNotificationsState()],
        canActivate: [authenticatedGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: 'search',
        loadChildren: () => import('./search-page/search-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: 'browse',
        loadChildren: () => import('./browse-by/browse-by-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: ADMIN_MODULE_PATH,
        loadChildren: () => import('./admin/admin-routes')
          .then((m) => m.ROUTES),
        canActivate: [siteAdministratorGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: NOTIFICATIONS_MODULE_PATH,
        loadChildren: () => import('./quality-assurance-notifications-pages/notifications-pages-routes')
          .then((m) => m.ROUTES),
        providers: [provideSuggestionNotificationsState()],
        canActivate: [authenticatedGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: 'standard-login',
        loadChildren: () => import('./login-page/login-page-routes').then((m) => m.ROUTES),
        data: {
          isBackDoor: true,
        },
        canMatch: [() => environment.auth.disableStandardLogin],
      },
      {
        path: 'login',
        loadChildren: () => import('./login-page/login-page-routes').then((m) => m.ROUTES),
        data: {
          isBackDoor: false,
        },
        canMatch: [() => !environment.auth.disableStandardLogin],
      },
      {
        path: 'logout',
        loadChildren: () => import('./logout-page/logout-page-routes')
          .then((m) => m.ROUTES),
      },
      {
        path: 'submit',
        loadChildren: () => import('./submit-page/submit-page-routes')
          .then((m) => m.ROUTES),
        providers: [provideSubmissionState()],
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: 'import-external',
        loadChildren: () => import('./import-external-page/import-external-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: 'workspaceitems',
        loadChildren: () => import('./workspaceitems-edit-page/workspaceitems-edit-page-routes')
          .then((m) => m.ROUTES),
        providers: [provideSubmissionState()],
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: WORKFLOW_ITEM_MODULE_PATH,
        providers: [provideSubmissionState()],
        loadChildren: () => import('./workflowitems-edit-page/workflowitems-edit-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: PROFILE_MODULE_PATH,
        loadChildren: () => import('./profile-page/profile-page-routes')
          .then((m) => m.ROUTES),
        providers: [provideSuggestionNotificationsState()],
        canActivate: [authenticatedGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: PROCESS_MODULE_PATH,
        loadChildren: () => import('./process-page/process-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [authenticatedGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: SUGGESTION_MODULE_PATH,
        loadChildren: () => import('./suggestions-page/suggestions-page-routes')
          .then((m) => m.ROUTES),
        providers: [provideSuggestionNotificationsState()],
        canActivate: [authenticatedGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: INFO_MODULE_PATH,
        loadChildren: () => import('./info/info-routes').then((m) => m.ROUTES),
      },
      {
        path: REQUEST_COPY_MODULE_PATH,
        loadChildren: () => import('./request-copy/request-copy-routes').then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: FORBIDDEN_PATH,
        component: ThemedForbiddenComponent,
        data: {
          title: FORBIDDEN_PATH,
        },
      },
      {
        path: 'statistics',
        loadChildren: () => import('./statistics-page/statistics-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: HEALTH_PAGE_PATH,
        loadChildren: () => import('./health-page/health-page-routes')
          .then((m) => m.ROUTES),
      },
      {
        path: ACCESS_CONTROL_MODULE_PATH,
        loadChildren: () => import('./access-control/access-control-routes').then((m) => m.ROUTES),
        canActivate: [groupAdministratorGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: 'auditlogs',
        loadChildren: () => import('./audit-page/audit-page-routes').then((m) => m.ROUTES),
        canActivate: [authenticatedGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: BULK_IMPORT_PATH,
        loadChildren: () => import('./bulk-import/bulk-import-page-routes').then((m) => m.ROUTES),
        canActivate: [authenticatedGuard, endUserAgreementCurrentUserGuard],
      },
      {
        path: 'edit-item-relationships',
        loadChildren: () => import('./edit-item-relationships/edit-item-relationships-routes').then((m) => m.ROUTES),
      },
      {
        path: 'explore',
        loadChildren: () => import('./explore-page/explore-routes').then((m) => m.ROUTES),
      },
      {
        path: EDIT_ITEM_PATH,
        loadChildren: () => import('./edit-item/edit-item-routes').then((m) => m.ROUTES),
        canActivate: [endUserAgreementCurrentUserGuard],
      },
      {
        path: 'external-login/:token',
        loadChildren: () => import('./external-login-page/external-login-page-routes')
          .then((m) => m.ROUTES),
      },
      {
        path: 'review-account/:token',
        loadChildren: () => import('./external-login-review-account-info-page/external-login-review-account-info-page-routes')
          .then((m) => m.ROUTES),
      },
      {
        path: 'email-confirmation',
        loadChildren: () => import('./external-login-email-confirmation-page/external-login-email-confirmation-page-routes')
          .then((m) => m.ROUTES),
      },
      {
        path: 'invitation',
        loadChildren: () => import('./invitation/invitation-routing/invitation-routes')
          .then((m) => m.ROUTES),
      },
      {
        path: 'luck-search',
        loadChildren: () => import('./lucky-search/lucky-search-routes')
          .then((m) => m.ROUTES),
      },
      {
        path: 'subscriptions',
        loadChildren: () => import('./subscriptions-page/subscriptions-page-routes')
          .then((m) => m.ROUTES),
        canActivate: [authenticatedGuard],
      },
      { path: '**', pathMatch: 'full', component: ThemedPageNotFoundComponent, data: { title: PAGE_NOT_FOUND_PATH }  },
    ],
  },
];
export const APP_ROUTING_CONF: RouterConfigOptions = {
  onSameUrlNavigation: 'reload',
};
export const APP_ROUTING_SCROLL_CONF: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};
