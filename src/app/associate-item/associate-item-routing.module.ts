import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AssociateItemResolver } from './associate-item.resolver';
import { AuthenticatedGuard } from '../core/auth/authenticated.guard';
import { DsoContextBreadcrumbResolver } from '../core/breadcrumbs/dso-context-breadcrumb.resolver';
import { AssociateItemPageComponent } from './associate-item-page.component';
import { AssociateItemGuard } from './guards/associate-item.guard';

@NgModule({
  imports: [
    RouterModule.forChild([
        {
          path: ':id/:type',
          component: AssociateItemPageComponent,
          resolve: {
            info: AssociateItemResolver,
            breadcrumb: DsoContextBreadcrumbResolver
          },
          data: {
            breadcrumbKey: 'associate.item',
          },
          canActivate: [AuthenticatedGuard, AssociateItemGuard],
        }
      ]
    )
  ],
  providers: [
    AssociateItemResolver,
  ]
})
export class AssociateItemRoutingModule {
}
