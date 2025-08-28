import { Route } from '@angular/router';

import { endUserAgreementCurrentUserGuard } from '../core/end-user-agreement/end-user-agreement-current-user.guard';
import { exploreI18nBreadcrumbResolver } from './explore-i18n-breadcrumb.resolver';
import { ThemedExplorePageComponent } from './themed-explore-page.component';

export const ROUTES: Route[] = [
  {
    path: ':id',
    component: ThemedExplorePageComponent,
    resolve: { breadcrumb: exploreI18nBreadcrumbResolver },
    data: { title: 'explore.title', breadcrumbKey: 'explore', showSocialButtons: true },
    canActivate: [endUserAgreementCurrentUserGuard],
  },
];
