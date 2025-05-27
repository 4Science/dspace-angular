import { Component } from '@angular/core';

import { SearchNavbarComponent as BaseComponent } from '../../../../app/search-navbar/search-navbar.component';

/**
 * The search box in the header that expands on focus and collapses on focus out
 */
@Component({
  selector: 'ds-themed-search-navbar',
  templateUrl: './search-navbar.component.html',
  styleUrls: ['./search-navbar.component.scss'],
  standalone: true,
})
export class SearchNavbarComponent extends BaseComponent {}
