import {
  Component,
  Input,
} from '@angular/core';

import { AdvancedTopSection } from '../../../../core/layout/models/section.model';
import { Context } from '../../../../core/shared/context.model';
import { ThemedComponent } from '../../../theme-support/themed.component';
import { AdvancedTopSectionComponent } from './advanced-top-section.component';

@Component({
  selector: 'ds-advanced-top-section',
  styleUrls: [],
  templateUrl: '../../../theme-support/themed.component.html',
  standalone: true,
  imports: [AdvancedTopSectionComponent],
})
export class ThemedAdvancedTopSectionComponent extends ThemedComponent<AdvancedTopSectionComponent> {

  @Input()
  sectionId: string;

  @Input()
  advancedTopSection: AdvancedTopSection;

  @Input()
  context: Context = Context.BrowseMostElements;

  protected inAndOutputNames: (keyof AdvancedTopSectionComponent & keyof this)[] = ['sectionId', 'advancedTopSection', 'context'];

  protected getComponentName(): string {
    return 'AdvancedTopSectionComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../../themes/${themeName}/app/shared/explore/section-component/advanced-top-section/advanced-top-section.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./advanced-top-section.component`);
  }
}
