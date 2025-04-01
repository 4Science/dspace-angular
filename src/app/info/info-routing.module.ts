import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { PRIVACY_PATH, END_USER_AGREEMENT_PATH, FEEDBACK_PATH, GENERAL_INFORMATION_PATH, OFFERED_SERVICES_PATH, HISTORY_DIGITAL_LID_PATH, ORGANIZATIONAL_STRUCTURE_PATH } from './info-routing-paths';
import { ThemedEndUserAgreementComponent } from './end-user-agreement/themed-end-user-agreement.component';
import { ThemedFeedbackComponent } from './feedback/themed-feedback.component';
import { FeedbackGuard } from '../core/feedback/feedback.guard';
import { environment } from '../../environments/environment';
import { CmsInfoComponent } from './cms-info/cms-info.component';


const imports = [
  RouterModule.forChild([
    {
      path: FEEDBACK_PATH,
      component: ThemedFeedbackComponent,
      resolve: { breadcrumb: I18nBreadcrumbResolver },
      data: { title: 'info.feedback.title', breadcrumbKey: 'info.feedback' },
      canActivate: [FeedbackGuard]
    }
  ])
];

function cmsInfoRoute(qualifier: string, schema: string): Route {
  return {
    path: qualifier,
    component: CmsInfoComponent,
    resolve: { breadcrumb: I18nBreadcrumbResolver },
    data: { title: `info.${qualifier}.title`, breadcrumbKey: `info.${qualifier}`, schema: schema, qualifier: qualifier }
  };
}

if (environment.info.enableEndUserAgreement) {
  imports.push(
    RouterModule.forChild([
      {
        path: END_USER_AGREEMENT_PATH,
        component: ThemedEndUserAgreementComponent,
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: { title: 'info.end-user-agreement.title', breadcrumbKey: 'info.end-user-agreement' }
      }
    ]));
}
if (environment.info.enableGeneralInformation) {
  imports.push(
    RouterModule.forChild([
      cmsInfoRoute(GENERAL_INFORMATION_PATH, 'glam'),
    ]),
  );
}
if (environment.info.enableOfferedServices) {
  imports.push(
    RouterModule.forChild([
      cmsInfoRoute(OFFERED_SERVICES_PATH, 'glam'),
    ]),
  );
}
if (environment.info.enableHistoryDigital) {
  imports.push(
    RouterModule.forChild([
      cmsInfoRoute(HISTORY_DIGITAL_LID_PATH, 'glam'),
    ]),
  );
}
if (environment.info.enableOrgStructure) {
  imports.push(
    RouterModule.forChild([
      cmsInfoRoute(ORGANIZATIONAL_STRUCTURE_PATH, 'glam'),
    ]),
  );
}
if (environment.info.enablePrivacyStatement) {
  imports.push(
    RouterModule.forChild([
      cmsInfoRoute(PRIVACY_PATH, 'glam'),
    ]),
  );
}

@NgModule({
  imports: [
    ...imports
  ]
})
/**
 * Module for navigating to components within the info module
 */
export class InfoRoutingModule {
}
