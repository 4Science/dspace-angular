import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { BrowserOnlyPipe } from '../../../../../app/shared/utils/browser-only.pipe';
import { ClickOutsideDirective } from '../../../../../app/shared/utils/click-outside.directive';
import { SearchNavbarComponent } from '../search-navbar.component';

/**
 * The search box in the header that expands on focus and collapses on focus out
 */
@Component({
  selector: 'ds-mobile-search-navbar',
  templateUrl: './mobile-search-navbar.component.html',
  styleUrls: ['./mobile-search-navbar.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ClickOutsideDirective,
    TranslateModule,
    BrowserOnlyPipe,
  ],
})
export class MobileSearchNavbarComponent extends SearchNavbarComponent{}
