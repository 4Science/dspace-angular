import {
  Component,
  Input,
} from '@angular/core';

import { SearchSection } from '../../../../core/layout/models/section.model';
import { ThemedComponent } from '../../../theme-support/themed.component';
import { SearchSectionComponent } from './search-section.component';

@Component({
  selector: 'ds-search-section',
  styleUrls: [],
  templateUrl: '../../../theme-support/themed.component.html',
  standalone: true,
  imports: [SearchSectionComponent],
})
export class ThemedSearchSectionComponent extends ThemedComponent<SearchSectionComponent> {

  @Input()
    sectionId: string;

  @Input()
    searchSection: SearchSection;

  protected inAndOutputNames: (keyof SearchSectionComponent & keyof this)[] = ['sectionId', 'searchSection'];

  protected getComponentName(): string {
    return 'SearchSectionComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../../themes/${themeName}/app/shared/explore/section-component/search-section/search-section.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./search-section.component`);
  }

}
