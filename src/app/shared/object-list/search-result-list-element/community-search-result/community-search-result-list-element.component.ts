import { NgClass } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { CommunitySearchResult } from '@dspace/core';
import { Community } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { ThemedBadgesComponent } from '../../../object-collection/shared/badges/themed-badges.component';
import { listableObjectComponent } from '../../../object-collection/shared/listable-object/listable-object.decorator';
import { SearchResultListElementComponent } from '../search-result-list-element.component';

@Component({
  selector: 'ds-community-search-result-list-element',
  styleUrls: ['../search-result-list-element.component.scss', 'community-search-result-list-element.component.scss'],
  templateUrl: 'community-search-result-list-element.component.html',
  standalone: true,
  imports: [NgClass, ThemedBadgesComponent, RouterLink],
})
/**
 * Component representing a community search result in list view
 */
@listableObjectComponent(CommunitySearchResult, ViewMode.ListElement)
export class CommunitySearchResultListElementComponent extends SearchResultListElementComponent<CommunitySearchResult, Community> implements OnInit {
  /**
   * Display thumbnails if required by configuration
   */
  showThumbnails: boolean;

  ngOnInit(): void {
    super.ngOnInit();
    this.showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
  }
}
