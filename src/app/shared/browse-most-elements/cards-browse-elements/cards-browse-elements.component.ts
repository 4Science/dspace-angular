import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';

import { CollectionElementLinkType } from '../../object-collection/collection-element-link.type';
import { ObjectGridComponent } from '../../object-grid/object-grid.component';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';

@Component({
  selector: 'ds-base-cards-browse-elements',
  templateUrl: './cards-browse-elements.component.html',
  styleUrls: ['./cards-browse-elements.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    ObjectGridComponent,
  ],
})
export class CardsBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit {

  public collectionElementLinkTypeEnum = CollectionElementLinkType;

  protected followMetricsLink: boolean;
  protected followThumbnailLink: boolean;

  ngOnInit() {
    this.followMetricsLink = this.showMetrics ?? this.appConfig.browseBy.showMetrics;
    this.followThumbnailLink = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    super.ngOnInit();
  }

}
