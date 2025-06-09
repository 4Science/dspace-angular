import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SearchNavbarComponent as BaseComponent } from '../../../../app/search-navbar/search-navbar.component';
import { BrowserOnlyPipe } from '../../../../app/shared/utils/browser-only.pipe';

/**
 * The search box in the header that expands on focus and collapses on focus out
 */
@Component({
  selector: 'ds-themed-search-navbar',
  templateUrl: './search-navbar.component.html',
  styleUrls: ['./search-navbar.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    BrowserOnlyPipe,
  ],
})
export class SearchNavbarComponent extends BaseComponent {}
