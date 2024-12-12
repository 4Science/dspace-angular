import { Route } from '@angular/router';

import { authenticatedGuard } from '../../core/auth/authenticated.guard';
import { i18nBreadcrumbResolver } from '../../core/breadcrumbs/i18n-breadcrumb.resolver';
import { qualityAssuranceBreadcrumbResolver } from '../../core/breadcrumbs/quality-assurance-breadcrumb.resolver';
import { adminNotificationsPublicationClaimPageResolver } from '../../quality-assurance-notifications-pages/notifications-suggestion-targets-page/notifications-suggestion-targets-page-resolver.service';
import { QualityAssuranceEventsPageComponent } from '../../quality-assurance-notifications-pages/quality-assurance-events-page/quality-assurance-events-page.component';
import { qualityAssuranceEventsPageResolver } from '../../quality-assurance-notifications-pages/quality-assurance-events-page/quality-assurance-events-page.resolver';
import { qualityAssuranceSourceDataResolver } from '../../quality-assurance-notifications-pages/quality-assurance-source-page-component/quality-assurance-source-data.resolver';
import { QualityAssuranceSourcePageComponent } from '../../quality-assurance-notifications-pages/quality-assurance-source-page-component/quality-assurance-source-page.component';
import { qualityAssuranceSourcePageResolver } from '../../quality-assurance-notifications-pages/quality-assurance-source-page-component/quality-assurance-source-page-resolver.service';
import { QualityAssuranceTopicsPageComponent } from '../../quality-assurance-notifications-pages/quality-assurance-topics-page/quality-assurance-topics-page.component';
import { qualityAssuranceTopicsPageResolver } from '../../quality-assurance-notifications-pages/quality-assurance-topics-page/quality-assurance-topics-page-resolver.service';
import { AdminNotificationsPublicationClaimPageComponent } from './admin-notifications-publication-claim-page/admin-notifications-publication-claim-page.component';
import {
  PUBLICATION_CLAIMS_PATH,
  QUALITY_ASSURANCE_EDIT_PATH,
} from './admin-notifications-routing-paths';

export const ROUTES: Route[] = [
  {
    canActivate: [ authenticatedGuard ],
    path: `${PUBLICATION_CLAIMS_PATH}`,
    component: AdminNotificationsPublicationClaimPageComponent,
    pathMatch: 'full',
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
      suggestionTargetParams: adminNotificationsPublicationClaimPageResolver,
    },
    data: {
      title: 'admin.notifications.publicationclaim.page.title',
      breadcrumbKey: 'admin.notifications.publicationclaim',
      showBreadcrumbsFluid: false,
    },
  },
  {
    canActivate: [authenticatedGuard],
    path: `${QUALITY_ASSURANCE_EDIT_PATH}/:sourceId`,
    component: QualityAssuranceTopicsPageComponent,
    pathMatch: 'full',
    resolve: {
      breadcrumb: qualityAssuranceBreadcrumbResolver,
      openaireQualityAssuranceTopicsParams: qualityAssuranceTopicsPageResolver,
    },
    data: {
      title: 'admin.quality-assurance.page.title',
      breadcrumbKey: 'admin.quality-assurance',
      showBreadcrumbsFluid: false,
    },
  },
  {
    canActivate: [ authenticatedGuard ],
    path: `${QUALITY_ASSURANCE_EDIT_PATH}/:sourceId/target/:targetId`,
    component: QualityAssuranceTopicsPageComponent,
    pathMatch: 'full',
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
      openaireQualityAssuranceTopicsParams: qualityAssuranceTopicsPageResolver,
    },
    data: {
      title: 'admin.quality-assurance.page.title',
      breadcrumbKey: 'admin.quality-assurance',
      showBreadcrumbsFluid: false,
    },
  },
  {
    canActivate: [authenticatedGuard],
    path: `${QUALITY_ASSURANCE_EDIT_PATH}`,
    component: QualityAssuranceSourcePageComponent,
    pathMatch: 'full',
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
      openaireQualityAssuranceSourceParams: qualityAssuranceSourcePageResolver,
      sourceData: qualityAssuranceSourceDataResolver,
    },
    data: {
      title: 'admin.notifications.source.breadcrumbs',
      breadcrumbKey: 'admin.notifications.source',
      showBreadcrumbsFluid: false,
    },
  },
  {
    canActivate: [authenticatedGuard],
    path: `${QUALITY_ASSURANCE_EDIT_PATH}/:sourceId/:topicId`,
    component: QualityAssuranceEventsPageComponent,
    pathMatch: 'full',
    resolve: {
      breadcrumb: qualityAssuranceBreadcrumbResolver,
      openaireQualityAssuranceEventsParams: qualityAssuranceEventsPageResolver,
    },
    data: {
      title: 'admin.notifications.event.page.title',
      breadcrumbKey: 'admin.notifications.event',
      showBreadcrumbsFluid: false,
    },
  },
];

