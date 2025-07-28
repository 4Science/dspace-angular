import {
  AsyncPipe,
  NgForOf,
  NgIf,
  NgSwitch,
  NgSwitchCase,
} from '@angular/common';
import { Component } from '@angular/core';

import { SectionComponent } from '../../../../app/core/layout/models/section.model';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions-popup/suggestions-popup.component';
import { isEmpty } from '../../../../app/shared/empty.util';
import { ThemedAdvancedTopSectionComponent } from '../../../../app/shared/explore/section-component/advanced-top-section/themed-advanced-top-section.component';
import { ThemedBrowseSectionComponent } from '../../../../app/shared/explore/section-component/browse-section/themed-browse-section.component';
import { ThemedCarouselSectionComponent } from '../../../../app/shared/explore/section-component/carousel-section/themed-carousel-section.component';
import { ThemedCountersSectionComponent } from '../../../../app/shared/explore/section-component/counters-section/themed-counters-section.component';
import { ThemedFacetSectionComponent } from '../../../../app/shared/explore/section-component/facet-section/themed-facet-section.component';
import { ThemedGridSectionComponent } from '../../../../app/shared/explore/section-component/grid-section/themed-grid-section.component';
import { ThemedSearchSectionComponent } from '../../../../app/shared/explore/section-component/search-section/themed-search-section.component';
import { ThemedSliderSectionComponent } from '../../../../app/shared/explore/section-component/slider-section/themed-slider-section.component';
import { ThemedTextSectionComponent } from '../../../../app/shared/explore/section-component/text-section/themed-text-section.component';
import { ThemedTopSectionComponent } from '../../../../app/shared/explore/section-component/top-section/themed-top-section.component';
import { ThemedTwitterSectionComponent } from '../../../../app/shared/explore/section-component/twitter-section/themed-twitter-section.component';
import { ViewTrackerComponent } from '../../../../app/statistics/angulartics/dspace/view-tracker.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ds-themed-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html',
  standalone: true,
  imports: [
    ThemedTopSectionComponent,
    ThemedBrowseSectionComponent,
    NgForOf,
    NgIf,
    AsyncPipe,
    NgSwitch,
    ThemedSearchSectionComponent,
    ThemedFacetSectionComponent,
    ThemedCountersSectionComponent,
    ThemedTextSectionComponent,
    ThemedCarouselSectionComponent,
    ThemedSliderSectionComponent,
    ThemedGridSectionComponent,
    ThemedTwitterSectionComponent,
    ThemedAdvancedTopSectionComponent,
    ViewTrackerComponent,
    SuggestionsPopupComponent,
    NgSwitchCase,
  ],
})
export class HomePageComponent extends BaseComponent {

  /*
  CRIS SECTIONS - ALTERNATE BACKGROUND

  Set property "environment.layout.sections.enableAlternateBackground" to true to enable
  alternate (light/dark) background for each row-

  Set "environment.layout.sections.skipAlternateBackgroundRows" to N in order not to apply
  the alternate background to the first N rows.

  Set "environment.layout.sections.oddRowsAreDark" to:
  - true, if the odd rows should have a dark background;
  - false, if the even rows should have a dark background.

  If the background color is not as expected, check if there is any empty section.

  If any element of the section should have the opposite color with respect to the row background
  then apply the class "cris-section-element-background" to the element.

  Do not use "bg-light" in cris-sections.xml.
   */

  readonly lightRowModulo = environment.layout.sections.startWithDarkRow ? 0 : 1;
  readonly darkRowModulo = environment.layout.sections.startWithDarkRow ? 1 : 0;

  /**
   * Get the one-based row number (returns 0 if the alternate background does not apply to that row)
   */
  protected alternateRowNumber(rowIndex: number): number {
    return this.isAlternateBackgroundEnabled ? Math.max(rowIndex + 1 - environment.layout.sections.skipAlternateBackgroundRows, 0) : 0;
  }

  /**
   * Add cris-section-*-row classes only if alternate background is enabled
   */
  get isAlternateBackgroundEnabled() {
    return environment.layout.sections.enableAlternateBackground;
  }


  /**
   * Return true if the light background should be applied to the row.
   * Return false if the alternate background is disabled or the row is skipped
   * @param rowIndex
   */
  isLightRow(rowIndex: number): boolean {
    const rowNumber = this.alternateRowNumber(rowIndex);
    return rowNumber > 0 && rowNumber % 2 === this.lightRowModulo;
  }

  /**
   * Return true if the dark background should be applied to the row.
   * Return false if the alternate background is disabled or the row is skipped
   * @param rowIndex
   */
  isDarkRow(rowIndex: number): boolean {
    const rowNumber = this.alternateRowNumber(rowIndex);
    return rowNumber > 0 && rowNumber % 2 === this.darkRowModulo;
  }

  componentClass(sectionComponent: SectionComponent): string {
    const defaultCol = 'col-12';
    const colClassRegex = /\bcol((-\w+)?-\d+)?\b/; // test for Bootstrap's "col" classes

    const classArray: string[] = [sectionComponent.style];

    // Add Bootstrap's "col"" class if missing
    if (isEmpty(sectionComponent.style) || !colClassRegex.test(sectionComponent.style)) {
      classArray.push(defaultCol);
    }

    return classArray.join(' ');
  }

  componentRowClass(input: SectionComponent[]): string {
    const horizontalPaddingClass = 'default-horizontal-padding';
    const verticalPaddingClass = 'default-vertical-padding';

    const classArray: string[] = [];

    if (!(input.length === 1 && input[0].componentType === 'carousel')) {
      classArray.push(horizontalPaddingClass);
      classArray.push(verticalPaddingClass);
    }

    return classArray.join(' ');
  }

}
