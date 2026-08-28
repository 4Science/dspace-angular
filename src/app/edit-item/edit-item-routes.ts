import { Route } from '@angular/router';

import { authenticatedGuard } from '../core/auth/authenticated.guard';
import { editItemBreadcrumbResolver } from '../core/breadcrumbs/edit-item-breadcrumb.resolver';
import { i18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { pendingChangesGuard } from '../submission/edit/pending-changes/pending-changes.guard';
import { ThemedSubmissionEditComponent } from '../submission/edit/themed-submission-edit.component';

export const ROUTES: Route[] = [
  {
    path: ':id',
    runGuardsAndResolvers: 'always',
    resolve: {
      breadcrumb: editItemBreadcrumbResolver,
    },
    children: [
      {
        path: '',
        canActivate: [authenticatedGuard],
        canDeactivate: [pendingChangesGuard],
        component: ThemedSubmissionEditComponent,
        resolve: {
          breadcrumb: i18nBreadcrumbResolver,
        },
        data: { title: 'submission.edit.title', breadcrumbKey: 'submission.edit' },
      },
    ],
  },
];
