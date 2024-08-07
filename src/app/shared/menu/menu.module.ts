import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MenuComponent } from './menu.component';
import { ExternalLinkMenuItemComponent } from './menu-item/external-link-menu-item.component';
import { LinkMenuItemComponent } from './menu-item/link-menu-item.component';
import { OnClickMenuItemComponent } from './menu-item/onclick-menu-item.component';
import { TextMenuItemComponent } from './menu-item/text-menu-item.component';
import { MenuSectionComponent } from './menu-section/menu-section.component';

const COMPONENTS = [
  MenuSectionComponent,
  MenuComponent,
];

const ENTRY_COMPONENTS = [
  TextMenuItemComponent,
  LinkMenuItemComponent,
  OnClickMenuItemComponent,
  ExternalLinkMenuItemComponent,
];

const MODULES = [
  TranslateModule,
  RouterModule,
  CommonModule,
];
const PROVIDERS = [

];

@NgModule({
  imports: [
    ...MODULES,
  ],
  declarations: [
    ...COMPONENTS,
    ...ENTRY_COMPONENTS,
  ],
  providers: [
    ...PROVIDERS,
    ...ENTRY_COMPONENTS,
  ],
  exports: [
    ...COMPONENTS,
  ],
})

/**
 * This module handles all components, providers and modules that are needed for the menu
 */
export class MenuModule {

}
