import {
  Component,
  Inject,
  Injector,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenuID } from 'src/app/shared/menu/menu-id.model';
import { rendersSectionForMenu } from 'src/app/shared/menu/menu-section.decorator';
import { MenuSection } from 'src/app/shared/menu/menu-section.model';
import { MenuSectionComponent } from 'src/app/shared/menu/menu-section/menu-section.component';

import { hasValue } from '../../../empty.util';
import { MenuService } from '../../../menu/menu.service';

/**
 * Represents an expandable section in the dso edit menus
 */
@Component({
  selector: 'ds-dso-edit-menu-expandable-section',
  templateUrl: './dso-edit-menu-expandable-section.component.html',
  styleUrls: ['./dso-edit-menu-expandable-section.component.scss'],
})
@rendersSectionForMenu(MenuID.DSO_EDIT, true)
export class DsoEditMenuExpandableSectionComponent extends MenuSectionComponent {

  menuID: MenuID = MenuID.DSO_EDIT;
  itemModel;

  renderIcons$: Observable<boolean>;

  constructor(
    @Inject('sectionDataProvider') menuSection: MenuSection,
    protected menuService: MenuService,
    protected injector: Injector,
    protected router: Router,
  ) {
    super(menuSection, menuService, injector);
    this.itemModel = menuSection.model;
  }

  ngOnInit(): void {
    this.menuService.activateSection(this.menuID, this.section.id);
    super.ngOnInit();

    this.renderIcons$ = this.subSections$.pipe(
      map((sections: MenuSection[]) => {
        return sections.some(section => hasValue(section.icon));
      }),
    );
  }
}
