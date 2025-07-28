import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { AuthNavMenuComponent as BaseComponent } from '../../../../../app/shared/auth-nav-menu/auth-nav-menu.component';
import { ThemedUserMenuComponent } from '../../../../../app/shared/auth-nav-menu/user-menu/themed-user-menu.component';
import { ThemedLogInComponent } from '../../../../../app/shared/log-in/themed-log-in.component';
import { BrowserOnlyPipe } from '../../../../../app/shared/utils/browser-only.pipe';


@Component({
  selector: 'ds-themed-auth-nav-menu',
  styleUrls: ['./auth-nav-menu.component.scss'],
  templateUrl: './auth-nav-menu.component.html',
  standalone: true,
  imports: [
    ThemedLogInComponent,
    TranslateModule,
    BrowserOnlyPipe,
    AsyncPipe,
    NgClass,
    NgbDropdownModule,
    RouterLink,
    RouterLinkActive,
    ThemedUserMenuComponent,
    NgIf,
  ],
})
export class AuthNavMenuComponent extends BaseComponent {}
