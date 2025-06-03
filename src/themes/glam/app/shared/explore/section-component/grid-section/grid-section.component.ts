import {
  AsyncPipe,
  NgForOf,
  NgIf,
  SlicePipe,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { getItemPageRoute } from '../../../../../../../app/item-page/item-page-routing-paths';
import { GridSectionComponent as BaseComponent } from '../../../../../../../app/shared/explore/section-component/grid-section/grid-section.component';
import { BackgroundImageDirective } from '../../../../../../../app/shared/utils/background-image.directive';


@Component({
  selector: 'ds-themed-grid-section',
  styleUrls: ['./grid-section.component.scss'],
  templateUrl: './grid-section.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    TranslateModule,
    SlicePipe,
    AsyncPipe,
    BackgroundImageDirective,
    RouterLink,
    NgxSkeletonLoaderModule,
  ],
})
export class GridSectionComponent extends BaseComponent {
  /**
   * to get the route of the item
   * @param item
   * @returns route to the item as a string
   */
  getItemPageRoute(item) {
    return getItemPageRoute(item);
  }
}
