import { Route } from '@angular/router';

import { i18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { AdminCurationTasksComponent } from './admin-curation-tasks/admin-curation-tasks.component';
import { AdminEditUserAgreementComponent } from './admin-edit-user-agreement/admin-edit-user-agreement.component';
import { BatchImportPageComponent } from './admin-import-batch-page/batch-import-page.component';
import { ThemedMetadataImportPageComponent } from './admin-import-metadata-page/themed-metadata-import-page.component';
import {
  LDN_PATH,
  NOTIFICATIONS_MODULE_PATH,
  NOTIFY_DASHBOARD_MODULE_PATH,
  REGISTRIES_MODULE_PATH,
  REPORTS_MODULE_PATH,
} from './admin-routing-paths';
import { AdminSearchPageComponent } from './admin-search-page/admin-search-page.component';
import { AdminWorkflowPageComponent } from './admin-workflow-page/admin-workflow-page.component';
import { EditCmsMetadataComponent } from './edit-cms-metadata/edit-cms-metadata.component';

export const ROUTES: Route[] = [
  {
    path: NOTIFICATIONS_MODULE_PATH,
    loadChildren: () => import('./admin-notifications/admin-notifications-routes')
      .then((m) => m.ROUTES),
  },
  {
    path: REGISTRIES_MODULE_PATH,
    loadChildren: () => import('./admin-registries/admin-registries-routes')
      .then((m) => m.ROUTES),
  },
  {
    path: 'search',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    component: AdminSearchPageComponent,
    data: { title: 'admin.search.title', breadcrumbKey: 'admin.search' },
  },
  {
    path: 'workflow',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    component: AdminWorkflowPageComponent,
    data: { title: 'admin.workflow.title', breadcrumbKey: 'admin.workflow' },
  },
  {
    path: 'curation-tasks',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    component: AdminCurationTasksComponent,
    data: { title: 'admin.curation-tasks.title', breadcrumbKey: 'admin.curation-tasks' },
  },
  {
    path: 'metadata-import',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    component: ThemedMetadataImportPageComponent,
    data: { title: 'admin.metadata-import.title', breadcrumbKey: 'admin.metadata-import' },
  },
  {
    path: 'batch-import',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    component: BatchImportPageComponent,
    data: { title: 'admin.batch-import.title', breadcrumbKey: 'admin.batch-import' },
  },
  {
    path: 'system-wide-alert',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    loadChildren: () => import('../system-wide-alert/system-wide-alert-routes').then((m) => m.ROUTES),
    data: { title: 'admin.system-wide-alert.title', breadcrumbKey: 'admin.system-wide-alert' },
  },
  {
    path: 'edit-user-agreement',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    component: AdminEditUserAgreementComponent,
    data: { title: 'admin.edit-user-agreement.title', breadcrumbKey: 'admin.edit-user-agreement' },
  },
  {
    path: 'edit-cms-metadata',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    component: EditCmsMetadataComponent,
    data: { title: 'admin.edit-cms-metadata.title', breadcrumbKey: 'admin.edit-cms-metadata' },
  },
  {
    path: LDN_PATH,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'services' },
      {
        path: 'services',
        loadChildren: () => import('./admin-ldn-services/admin-ldn-services-routes')
          .then((m) => m.ROUTES),
      },
    ],
  },
  {
    path: REPORTS_MODULE_PATH,
    loadChildren: () => import('./admin-reports/admin-reports-routes')
      .then((m) => m.ROUTES),
  },
  {
    path: NOTIFY_DASHBOARD_MODULE_PATH,
    loadChildren: () => import('./admin-notify-dashboard/admin-notify-dashboard-routes')
      .then((m) => m.ROUTES),
  },
];
