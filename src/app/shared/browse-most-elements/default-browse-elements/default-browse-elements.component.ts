import { Component, Input, OnChanges } from '@angular/core';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';
import { LayoutModeEnum } from '../../../core/layout/models/section.model';

@Component({
  selector: 'ds-default-browse-elements',
  templateUrl: './default-browse-elements.component.html',
  styleUrls: ['./default-browse-elements.component.scss']
})
export class DefaultBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnChanges {

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics: any;

  /**
   * Whether to show the thumbnail preview
   */
  @Input() showThumbnails = this.appConfig.browseBy.showThumbnails;

  @Input() mode: LayoutModeEnum;

  ngOnChanges(): void {
    this.getAllBitstreams(this.showThumbnails);
  }

}
