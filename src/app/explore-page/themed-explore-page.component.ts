import { Component } from '@angular/core';

import { ThemedComponent } from '../shared/theme-support/themed.component';
import { ExplorePageComponent } from './explore-page.component';

@Component({
  selector: 'ds-explore-page',
  styleUrls: [],
  templateUrl: '../shared/theme-support/themed.component.html',
  standalone: true,
  imports: [ExplorePageComponent],
})
export class ThemedExplorePageComponent extends ThemedComponent<ExplorePageComponent> {

  protected getComponentName(): string {
    return 'ExplorePageComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../themes/${themeName}/app/explore-page/explore-page.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./explore-page.component`);
  }

}
