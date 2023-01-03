import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExploreI18nBreadcrumbResolver } from './explore-i18n-breadcrumb.resolver';
import { EndUserAgreementCurrentUserGuard } from '../core/end-user-agreement/end-user-agreement-current-user.guard';
import { ThemedExplorePageComponent } from "./themed-explore-page.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: ':id',
        component: ThemedExplorePageComponent,
        resolve: { breadcrumb: ExploreI18nBreadcrumbResolver },
        data: { title: 'explore.title', breadcrumbKey: 'explore', showSocialButtons: true },
        canActivate: [EndUserAgreementCurrentUserGuard]
      },
    ])
  ],
  providers: [
     ExploreI18nBreadcrumbResolver,
  ]
})
export class ExploreRoutingModule {

}
