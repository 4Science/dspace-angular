import {
  AsyncPipe,
  isPlatformBrowser,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  map,
  Observable,
  switchMap,
} from 'rxjs';

import { BitstreamImagesService } from '../../../core/services/bitstream-images.service';
import { Item } from '../../../core/shared/item.model';
import { ThemedTypeBadgeComponent } from '../../object-collection/shared/badges/type-badge/themed-type-badge.component';
import { BackgroundImageDirective } from '../../utils/background-image.directive';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';

@Component({
  selector: 'ds-base-images-browse-elements',
  templateUrl: './images-browse-elements.component.html',
  styleUrls: ['./images-browse-elements.component.scss'],
  standalone: true,
  imports: [
    BackgroundImageDirective,
    AsyncPipe,
    ThemedTypeBadgeComponent,
    RouterLink,
    NgxSkeletonLoaderModule,
    NgIf,
    NgForOf,
  ],
})
export class ImagesBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit {

  /**
   * Images with height/width ratio below this value are considered to be square
   */
  readonly maxSquareRatio = 1.3;

  protected followThumbnailLink = false; // not required as ORIGINAL bundle is used
  protected followMetricsLink = false;

  private readonly bitstreamImagesService = inject(BitstreamImagesService);

  itemToImageHrefMap$: Observable<Map<string, string>>;

  totalElements$: Observable<number>;

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    super.ngOnInit();

    this.itemToImageHrefMap$ = this.searchResultArray$.pipe(
      switchMap((res) => this.bitstreamImagesService.getItemToImageMap(res as Item[])),
    );

    this.totalElements$ = this.searchResults$.pipe(
      map((searchResults) => searchResults?.payload?.pageInfo?.totalElements),
    );
  }

}
