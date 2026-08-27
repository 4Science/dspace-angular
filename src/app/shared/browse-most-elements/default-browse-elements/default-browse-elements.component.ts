import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { ListableObjectComponentLoaderComponent } from '../../object-collection/shared/listable-object/listable-object-component-loader.component';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';

@Component({
  selector: 'ds-base-default-browse-elements',
  templateUrl: './default-browse-elements.component.html',
  styleUrls: ['./default-browse-elements.component.scss'],
  imports: [
    AsyncPipe,
    ListableObjectComponentLoaderComponent,
    NgxSkeletonLoaderModule,
    TranslateModule,
  ],
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
