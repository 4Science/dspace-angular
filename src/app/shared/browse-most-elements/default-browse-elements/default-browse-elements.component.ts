import {
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';

import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';

@Component({
  selector: 'ds-default-browse-elements',
  templateUrl: './default-browse-elements.component.html',
  styleUrls: ['./default-browse-elements.component.scss'],
})
export class DefaultBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit, OnChanges {

  protected followMetricsLink: boolean;
  protected followThumbnailLink: boolean;

  /**
   * Array used to render skeleton placeholder items.
   * Length matches the configured page size.
   */
  skeletonItems: number[];

  ngOnInit() {
    this.followMetricsLink = this.showMetrics ?? this.appConfig.browseBy.showMetrics;
    this.followThumbnailLink = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    this.skeletonItems = Array.from(
      { length: this.paginatedSearchOptions?.pagination?.pageSize ?? 5 },
      (_, i) => i,
    );
    super.ngOnInit();
  }
}
