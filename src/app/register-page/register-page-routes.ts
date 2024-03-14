import { Route } from '@angular/router';

import { EndUserAgreementCookieGuard } from '../core/end-user-agreement/end-user-agreement-cookie.guard';
import { ItemPageResolver } from '../item-page/item-page.resolver';
import { ThemedCreateProfileComponent } from './create-profile/themed-create-profile.component';
import { ThemedRegisterEmailComponent } from './register-email/themed-register-email.component';
import { RegistrationGuard } from './registration.guard';


export const ROUTES: Route[] = [
  {
    path: '',
    component: ThemedRegisterEmailComponent,
    providers: [
      ItemPageResolver,
    ],
    data: { title: 'register-email.title' },
  },
  {
    path: ':token',
    component: ThemedCreateProfileComponent,
    providers: [
      ItemPageResolver,
    ],
    canActivate: [
      RegistrationGuard,
      EndUserAgreementCookieGuard,
    ],
  },
];