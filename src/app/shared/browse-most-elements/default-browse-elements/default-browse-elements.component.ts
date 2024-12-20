import { Component, OnChanges, OnInit } from '@angular/core';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';
import { LayoutModeEnum } from '../../../core/layout/models/section.model';

@Component({
  selector: 'ds-default-browse-elements',
  templateUrl: './default-browse-elements.component.html',
  styleUrls: ['./default-browse-elements.component.scss']
})
export class DefaultBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit, OnChanges {

  protected followMetricsLink: boolean;
  protected followThumbnailLink: boolean;

  layoutMode: LayoutModeEnum;

  ngOnInit() {
    this.followMetricsLink = this.showMetrics ?? this.appConfig.browseBy.showMetrics;
    this.followThumbnailLink = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    super.ngOnInit();
    this.layoutMode = this.topSection.defaultLayoutMode ?? LayoutModeEnum.LIST;
  }
}
