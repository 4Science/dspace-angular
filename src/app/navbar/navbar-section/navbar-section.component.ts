import {
  Component,
  Inject,
  Injector,
  OnInit,
} from '@angular/core';

import { MenuService } from '../../shared/menu/menu.service';
import { MenuID } from '../../shared/menu/menu-id.model';
import { rendersSectionForMenu } from '../../shared/menu/menu-section.decorator';
import { MenuSectionComponent } from '../../shared/menu/menu-section/menu-section.component';

/**
 * Represents a non-expandable section in the navbar
 */
@Component({
  selector: 'ds-navbar-section',
  templateUrl: './navbar-section.component.html',
  styleUrls: ['./navbar-section.component.scss'],
})
@rendersSectionForMenu(MenuID.PUBLIC, false)
export class NavbarSectionComponent extends MenuSectionComponent implements OnInit {
  /**
   * This section resides in the Public Navbar
   */
  menuID = MenuID.PUBLIC;

  constructor(@Inject('sectionDataProvider') menuSection,
              protected menuService: MenuService,
              protected injector: Injector,
  ) {
    super(menuSection, menuService, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }
}
