import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { ThemedLangSwitchComponent } from '../../../../app/shared/lang-switch/themed-lang-switch.component';
import { MobileSearchNavbarComponent } from '../search-navbar/mobile-search-navbar/mobile-search-navbar.component';

/**
 * Represents the header with the logo and simple navigation
 */
@Component({
  selector: 'ds-themed-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
  standalone: true,
  imports: [
    MobileSearchNavbarComponent,
    ThemedLangSwitchComponent,
    ThemedAuthNavMenuComponent,
    TranslateModule,
    NgbTooltipModule,
    ThemedNavbarComponent,
    RouterLink,
    NgIf,
  ],
})
export class HeaderComponent extends BaseComponent {
}
