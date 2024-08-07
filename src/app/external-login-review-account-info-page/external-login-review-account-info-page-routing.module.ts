import { NgModule } from '@angular/core';
import {
  RouterModule,
  Routes,
} from '@angular/router';

import { RegistrationDataResolver } from '../external-log-in/resolvers/registration-data.resolver';
import { ExternalLoginReviewAccountInfoPageComponent } from './external-login-review-account-info-page.component';
import { ReviewAccountGuard } from './helpers/review-account.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ExternalLoginReviewAccountInfoPageComponent,
    canActivate: [ReviewAccountGuard],
    resolve: { registrationData: RegistrationDataResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExternalLoginReviewAccountInfoRoutingModule {}
