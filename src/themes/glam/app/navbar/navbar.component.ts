import {
  AsyncPipe,
  isPlatformBrowser,
  NgClass,
  NgComponentOutlet,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { slideMobileNav } from '../../../../app/shared/animations/slide';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { ThemedUserMenuComponent } from '../../../../app/shared/auth-nav-menu/user-menu/themed-user-menu.component';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';
import { ThemedLangSwitchComponent } from '../../../../app/shared/lang-switch/themed-lang-switch.component';

/**
 * Component representing the public navbar
 */
@Component({
  selector: 'ds-themed-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  animations: [slideMobileNav],
  standalone: true,
  imports: [
    NgClass,
    TranslateModule,
    AsyncPipe,
    ThemedLangSwitchComponent,
    ThemedAuthNavMenuComponent,
    ImpersonateNavbarComponent,
    ThemedUserMenuComponent,
    ThemedSearchNavbarComponent,
    NgbTooltipModule,
    NgIf,
    NgForOf,
    NgComponentOutlet,
    RouterLink,
  ],
})
export class NavbarComponent extends BaseComponent {

  protected platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);
}
