import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { MetricsModule } from '../../../../../shared/metric/metrics.module';
import { ThemedBadgesComponent } from '../../../../../shared/object-collection/shared/badges/themed-badges.component';
import { listableObjectComponent } from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { AdditionalMetadataComponent } from '../../../../../shared/object-list/search-result-list-element/additional-metadata/additional-metadata.component';
import { ItemSearchResultListElementComponent } from '../../../../../shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { TruncatableComponent } from '../../../../../shared/truncatable/truncatable.component';
import { ThemedThumbnailComponent } from '../../../../../thumbnail/themed-thumbnail.component';

@listableObjectComponent('ProjectSearchResult', ViewMode.ListElement)
@Component({
  selector: 'ds-project-search-result-list-element',
  styleUrls: ['./project-search-result-list-element.component.scss'],
  templateUrl: './project-search-result-list-element.component.html',
  standalone: true,
  imports: [NgIf, RouterLink, ThemedThumbnailComponent, NgClass, TruncatableComponent, ThemedBadgesComponent, AsyncPipe, AdditionalMetadataComponent, MetricsModule],
})
/**
 * The component for displaying a list element for an item search result of the type Project
 */
export class ProjectSearchResultListElementComponent extends ItemSearchResultListElementComponent {

}
