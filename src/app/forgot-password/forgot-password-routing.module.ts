import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ItemPageResolver } from '../item-page/item-page.resolver';
import { RegistrationGuard } from '../register-page/registration.guard';
import { ThemedForgotEmailComponent } from './forgot-password-email/themed-forgot-email.component';
import { ThemedForgotPasswordFormComponent } from './forgot-password-form/themed-forgot-password-form.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ThemedForgotEmailComponent,
        data: { title: 'forgot-password.title' },
      },
      {
        path: ':token',
        component: ThemedForgotPasswordFormComponent,
        canActivate: [ RegistrationGuard ],
      },
    ]),
  ],
  providers: [
    ItemPageResolver,
  ],
})
/**
 * This module defines the routing to the components related to the forgot password components.
 */
export class ForgotPasswordRoutingModule {
}
