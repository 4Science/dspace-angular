import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';
import { map } from 'rxjs/operators';

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
  ],
})
export class ImageComponent extends BitstreamRenderingModelComponent implements OnInit {

  bitstream = new BehaviorSubject<Bitstream>(null);

  imageUrl$: Observable<string>;

  ngOnInit(): void {
    this.getBitstreamsByItem().pipe(
      getPaginatedListPayload(),
      map((filteredBitstreams: Bitstream[]) => filteredBitstreams.length > 0 ? filteredBitstreams[0] : null),
    ).subscribe((image) => {
      this.bitstream.next(image);
    });

    this.imageUrl$ = this.bitstream.asObservable().pipe(
      map((bitstream) => bitstream?._links?.content?.href),
    );

  }

  backgroundImageUrl(url: string) {
    return `url('${url}')`;
  }

}
