import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';
import { LayoutModeEnum } from '../../../core/layout/models/section.model';

@Component({
  selector: 'ds-default-browse-elements',
  templateUrl: './default-browse-elements.component.html',
  styleUrls: ['./default-browse-elements.component.scss']
})
export class DefaultBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit, OnChanges {

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics = this.appConfig.browseBy.showMetrics;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails = this.appConfig.browseBy.showThumbnails;

  protected followThumbnailLink = true;

  layoutMode: LayoutModeEnum;

  ngOnInit() {
    super.ngOnInit();
    this.layoutMode = this.topSection.defaultLayoutMode ?? LayoutModeEnum.LIST;
  }

}
