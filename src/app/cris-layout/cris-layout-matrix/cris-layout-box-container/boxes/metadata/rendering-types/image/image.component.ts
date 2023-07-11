import { Component, OnInit } from '@angular/core';
import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';

import { BitstreamRenderingModelComponent } from '../bitstream-rendering-model';
import { map } from 'rxjs/operators';
import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { getPaginatedListPayload } from '../../../../../../../core/shared/operators';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-image]',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
})
@MetadataBoxFieldRendering(FieldRenderingType.IMAGE, true)
export class ImageComponent extends BitstreamRenderingModelComponent implements OnInit {

  bitstream = new BehaviorSubject<Bitstream>(null);

  imageUrl$: Observable<string>;

  ngOnInit(): void {
    this.getBitstreamsByItem().pipe(
      getPaginatedListPayload(),
      map((filteredBitstreams: Bitstream[]) => filteredBitstreams.length > 0 ? filteredBitstreams[0] : null)
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
