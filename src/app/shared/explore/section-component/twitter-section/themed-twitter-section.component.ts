import { ThemedComponent } from '../../../theme-support/themed.component';
import { Component, Input } from '@angular/core';
import { TwitterSection, TwitterSectionComponent } from './twitter-section.component';

@Component({
  selector: 'ds-themed-twitter-section',
  styleUrls: [],
  templateUrl: '../../../theme-support/themed.component.html',
})
export class ThemedTwitterSectionComponent extends ThemedComponent<TwitterSectionComponent> {

  @Input()
  sectionId: string;

  @Input()
  twitterSection: TwitterSection;

  protected inAndOutputNames: (keyof TwitterSectionComponent & keyof this)[] = ['sectionId', 'twitterSection'];

  protected getComponentName(): string {
    return 'TwitterSectionComponent';
  }

  protected importThemedComponent(themeName: string): Promise<any> {
    return import(`../../../../../themes/${themeName}/app/shared/explore/section-component/twitter-section/twitter-section.component`);
  }

  protected importUnthemedComponent(): Promise<any> {
    return import(`./twitter-section.component`);
  }

}
