import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ProfilePageModule } from '../profile-page/profile-page.module';
import { RegisterEmailFormModule } from '../register-email-form/register-email-form.module';
import { SharedModule } from '../shared/shared.module';
import { ForgotEmailComponent } from './forgot-password-email/forgot-email.component';
import { ThemedForgotEmailComponent } from './forgot-password-email/themed-forgot-email.component';
import { ForgotPasswordFormComponent } from './forgot-password-form/forgot-password-form.component';
import { ThemedForgotPasswordFormComponent } from './forgot-password-form/themed-forgot-password-form.component';
import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ForgotPasswordRoutingModule,
    RegisterEmailFormModule,
    ProfilePageModule,
  ],
  declarations: [
    ForgotEmailComponent,
    ThemedForgotEmailComponent,
    ForgotPasswordFormComponent,
    ThemedForgotPasswordFormComponent,
  ],
  providers: [],
})

/**
 * Module related to the Forgot Password components
 */
export class ForgotPasswordModule {

}
