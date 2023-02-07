import { ThemedComponent } from '../../../theme-support/themed.component';
import { GridSectionComponent } from './grid-section.component';
import { Component, Input } from '@angular/core';
import { GridSection } from '../../../../core/layout/models/section.model';
import { Context } from '../../../../core/shared/context.model';
import { Site } from '../../../../core/shared/site.model';

@Component({
selector: 'ds-themed-grid-section',
styleUrls: [],
templateUrl: '../../../theme-support/themed.component.html',
})
export class ThemedGridSectionComponent extends ThemedComponent<GridSectionComponent> {

  @Input()
  sectionId: string;

  @Input()
  gridSection: GridSection;

  @Input()
  context: Context = Context.BrowseMostElements;

  @Input()
  site: Site;

  protected inAndOutputNames: (keyof GridSectionComponent & keyof this)[] = ['sectionId', 'gridSection', 'context', 'site'];

  protected getComponentName(): string {
  return 'GridSectionComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
  return import(`../../../../../themes/${themeName}/app/shared/explore/section-component/grid-section/grid-section.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
  return import(`./grid-section.component`);
  }

  }
