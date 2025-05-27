import {
  AsyncPipe,
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnChanges,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { LayoutModeEnum } from '../../../core/layout/models/section.model';
import { ThemedLoadingComponent } from '../../loading/themed-loading.component';
import { ListableObjectComponentLoaderComponent } from '../../object-collection/shared/listable-object/listable-object-component-loader.component';
import { ObjectGridComponent } from '../../object-grid/object-grid.component';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';

@Component({
  selector: 'ds-base-default-browse-elements',
  templateUrl: './default-browse-elements.component.html',
  styleUrls: ['./default-browse-elements.component.scss'],
  standalone: true,
  imports: [
    ListableObjectComponentLoaderComponent,
    TranslateModule,
    ThemedLoadingComponent,
    AsyncPipe,
    NgIf,
    NgForOf,
    NgClass,
    FormsModule,
    ObjectGridComponent,
  ],
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
