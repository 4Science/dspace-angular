import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuService } from '../shared/menu/menu.service';
import { MenuID } from '../shared/menu/menu-id.model';
import { HostWindowService, WidthCategory } from '../shared/host-window.service';
import { environment } from '../../environments/environment';

/**
 * Represents the header with the logo and simple navigation
 */
@Component({
  selector: 'ds-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
})
export class HeaderComponent implements OnInit {
  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated: Observable<boolean>;
  public isMobile$: Observable<boolean>;
  public showAuth = false;

  menuID = MenuID.PUBLIC;
  maxMobileWidth = WidthCategory.SM;
  mainSiteUrl = environment.mainSiteUrl;

  constructor(
    protected menuService: MenuService,
    protected windowService: HostWindowService,
  ) {
  }

  ngOnInit(): void {
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
  }

  public toggleNavbar(): void {
    this.menuService.toggleMenu(this.menuID);
  }
}
