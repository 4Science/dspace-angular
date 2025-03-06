import { Component } from '@angular/core';
import { SearchNavbarComponent } from "../search-navbar.component";

/**
 * The search box in the header that expands on focus and collapses on focus out
 */
@Component({
  selector: 'ds-mobile-search-navbar',
  templateUrl: './mobile-search-navbar.component.html',
  styleUrls: ['./mobile-search-navbar.component.scss'],
})
export class MobileSearchNavbarComponent extends SearchNavbarComponent{}
