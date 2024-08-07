import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { environment } from '../../environments/environment';
import { COAR_NOTIFY_SUPPORT } from '../app-routing-paths';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { NotifyInfoComponent } from '../core/coar-notify/notify-info/notify-info.component';
import { NotifyInfoGuard } from '../core/coar-notify/notify-info/notify-info.guard';
import { FeedbackGuard } from '../core/feedback/feedback.guard';
import { ThemedEndUserAgreementComponent } from './end-user-agreement/themed-end-user-agreement.component';
import { ThemedFeedbackComponent } from './feedback/themed-feedback.component';
import {
  END_USER_AGREEMENT_PATH,
  FEEDBACK_PATH,
  PRIVACY_PATH,
} from './info-routing-paths';
import { ThemedPrivacyComponent } from './privacy/themed-privacy.component';

const imports = [
  RouterModule.forChild([
    {
      path: FEEDBACK_PATH,
      component: ThemedFeedbackComponent,
      resolve: { breadcrumb: I18nBreadcrumbResolver },
      data: { title: 'info.feedback.title', breadcrumbKey: 'info.feedback' },
      canActivate: [FeedbackGuard],
    },
  ]),
  RouterModule.forChild([
    {
      path: COAR_NOTIFY_SUPPORT,
      component: NotifyInfoComponent,
      resolve: { breadcrumb: I18nBreadcrumbResolver },
      data: { title: 'info.coar-notify-support.title', breadcrumbKey: 'info.coar-notify' },
      canActivate: [NotifyInfoGuard],
    },
  ]),
];

if (environment.info.enableEndUserAgreement) {
  imports.push(
    RouterModule.forChild([
      {
        path: END_USER_AGREEMENT_PATH,
        component: ThemedEndUserAgreementComponent,
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: { title: 'info.end-user-agreement.title', breadcrumbKey: 'info.end-user-agreement' },
      },
    ]));
}
if (environment.info.enablePrivacyStatement) {
  imports.push(
    RouterModule.forChild([
      {
        path: PRIVACY_PATH,
        component: ThemedPrivacyComponent,
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: { title: 'info.privacy.title', breadcrumbKey: 'info.privacy' },
      },
    ]));
}

@NgModule({
  imports: [
    ...imports,
  ],
})
/**
 * Module for navigating to components within the info module
 */
export class InfoRoutingModule {
}
