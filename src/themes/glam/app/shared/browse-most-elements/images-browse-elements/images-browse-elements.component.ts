import {
  AsyncPipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { ImagesBrowseElementsComponent as BaseComponent } from  '../../../../../../app/shared/browse-most-elements/images-browse-elements/images-browse-elements.component';
import { ThemedTypeBadgeComponent } from '../../../../../../app/shared/object-collection/shared/badges/type-badge/themed-type-badge.component';
import { BackgroundImageDirective } from '../../../../../../app/shared/utils/background-image.directive';

@Component({
  selector: 'ds-themed-images-browse-elements',
  templateUrl: './images-browse-elements.component.html',
  styleUrls: ['./../../../../../../app/shared/browse-most-elements/images-browse-elements/images-browse-elements.component.scss'],
  standalone: true,
  imports: [
    ThemedTypeBadgeComponent,
    RouterLink,
    BackgroundImageDirective,
    NgxSkeletonLoaderModule,
    AsyncPipe,
    NgForOf,
    NgIf,
  ],
})
export class ImagesBrowseElementsComponent extends BaseComponent {

}
