import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';

import { CoreModule } from '../core/core.module';
import { NavbarEffects } from './navbar.effects';
import { NavbarSectionComponent } from './navbar-section/navbar-section.component';
import { ExpandableNavbarSectionComponent } from './expandable-navbar-section/expandable-navbar-section.component';
import { NavbarComponent } from './navbar.component';
import { MenuModule } from '../shared/menu/menu.module';
import { FormsModule } from '@angular/forms';

const effects = [
  NavbarEffects
];

const ENTRY_COMPONENTS = [
  // put only entry components that use custom decorator
  NavbarSectionComponent,
  ExpandableNavbarSectionComponent,
];

@NgModule({
  imports: [
    CommonModule,
    MenuModule,
    FormsModule,
    EffectsModule.forFeature(effects),
    CoreModule.forRoot()
  ],
  declarations: [
    NavbarComponent,
    NavbarSectionComponent,
    ExpandableNavbarSectionComponent
  ],
  providers: [

  ],
  entryComponents: [
    NavbarSectionComponent,
    ExpandableNavbarSectionComponent
  ],
  exports: [
    NavbarComponent,
    NavbarSectionComponent,
    ExpandableNavbarSectionComponent
  ]
})

/**
 * This module handles all components and pipes that are necessary for the horizontal navigation bar
 */
export class NavbarModule {
  /**
   * NOTE: this method allows to resolve issue with components that using a custom decorator
   * which are not loaded during CSR otherwise
   */
  static withEntryComponents() {
    return {
      ngModule: NavbarModule,
      providers: ENTRY_COMPONENTS.map((component) => ({provide: component}))
    };
  }

}
