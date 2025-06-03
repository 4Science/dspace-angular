import {
  AsyncPipe,
  NgClass,
  NgForOf,
  NgSwitch,
  NgSwitchCase,
} from '@angular/common';
import { Component } from '@angular/core';

import { ExplorePageComponent as BaseComponent } from '../../../../app/explore-page/explore-page.component';
import { ThemedAdvancedTopSectionComponent } from '../../../../app/shared/explore/section-component/advanced-top-section/themed-advanced-top-section.component';
import { ThemedBrowseSectionComponent } from '../../../../app/shared/explore/section-component/browse-section/themed-browse-section.component';
import { ThemedCarouselSectionComponent } from '../../../../app/shared/explore/section-component/carousel-section/themed-carousel-section.component';
import { ThemedCountersSectionComponent } from '../../../../app/shared/explore/section-component/counters-section/themed-counters-section.component';
import { ThemedFacetSectionComponent } from '../../../../app/shared/explore/section-component/facet-section/themed-facet-section.component';
import { ThemedGridSectionComponent } from '../../../../app/shared/explore/section-component/grid-section/themed-grid-section.component';
import { ThemedSearchSectionComponent } from '../../../../app/shared/explore/section-component/search-section/themed-search-section.component';
import { ThemedTextSectionComponent } from '../../../../app/shared/explore/section-component/text-section/themed-text-section.component';
import { ThemedTopSectionComponent } from '../../../../app/shared/explore/section-component/top-section/themed-top-section.component';
import { ThemedTwitterSectionComponent } from '../../../../app/shared/explore/section-component/twitter-section/themed-twitter-section.component';

/**
 * Component representing the explore section.
 */
@Component({
  selector: 'ds-themed-explore',
  styleUrls: ['./explore-page.component.scss'],
  templateUrl: './explore-page.component.html',
  standalone: true,
  imports: [
    ThemedTopSectionComponent,
    ThemedBrowseSectionComponent,
    ThemedSearchSectionComponent,
    ThemedFacetSectionComponent,
    ThemedCountersSectionComponent,
    ThemedTextSectionComponent,
    ThemedCarouselSectionComponent,
    ThemedGridSectionComponent,
    ThemedTwitterSectionComponent,
    ThemedAdvancedTopSectionComponent,
    NgClass,
    NgForOf,
    AsyncPipe,
    NgSwitch,
    NgSwitchCase,
  ],
})
export class ExplorePageComponent extends BaseComponent {}
