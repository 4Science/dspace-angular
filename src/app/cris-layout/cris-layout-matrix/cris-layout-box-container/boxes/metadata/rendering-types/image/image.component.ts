import {
  AsyncPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  BehaviorSubject,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  map,
} from 'rxjs/operators';

import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { getPaginatedListPayload } from '../../../../../../../core/shared/operators';
import { BitstreamRenderingModelComponent } from '../bitstream-rendering-model';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-image]',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    NgxSkeletonLoaderModule,
  ],
})
export class ImageComponent extends BitstreamRenderingModelComponent implements OnInit {

  bitstream = new BehaviorSubject<Bitstream>(null);

  imageUrl$: Observable<string>;

  platformId = inject(PLATFORM_ID);

  isLoading = true;
  isBrowser: boolean;

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.getBitstreamsByItem().pipe(
      getPaginatedListPayload(),
      map((filteredBitstreams: Bitstream[]) => filteredBitstreams.length > 0 ? filteredBitstreams[0] : null),
      catchError(() => {
        this.isLoading = false;
        return of(null);
      }),
    ).subscribe((image) => {
      this.bitstream.next(image);
      this.isLoading = false;
    });

    this.imageUrl$ = this.bitstream.asObservable().pipe(
      map((bitstream) => bitstream?._links?.content?.href),
    );

  }

}
