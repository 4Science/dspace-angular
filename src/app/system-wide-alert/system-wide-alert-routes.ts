import {
  SiteAdministratorGuard
} from '../core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
import { SystemWideAlertFormComponent } from './alert-form/system-wide-alert-form.component';
import { Route } from '@angular/router';

export const ROUTES: Route[] = [
  {
    path: '',
    canActivate: [SiteAdministratorGuard],
    component: SystemWideAlertFormComponent,
  },

];