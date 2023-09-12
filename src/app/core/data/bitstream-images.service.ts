import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { filter, map, mergeMap, scan, switchMap, take } from 'rxjs/operators';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { getFirstCompletedRemoteData } from '../shared/operators';
import { RemoteData } from './remote-data';
import { PaginatedList } from './paginated-list.model';
import { Bitstream } from '../shared/bitstream.model';
import { BitstreamFormat } from '../shared/bitstream-format.model';
import { hasValue } from '../../shared/empty.util';
import { ItemSearchResult } from '../../shared/object-collection/shared/item-search-result.model';
import { BitstreamDataService } from './bitstream-data.service';

@Injectable({ providedIn: 'root' })
export class BitstreamImagesService {

  constructor(protected bitstreamDataService: BitstreamDataService) {}

  findAllBitstreamImages(items: ItemSearchResult[]): Observable<Map<string, string>> {
    return from(items).pipe(
      map((itemSR) => itemSR.indexableObject),
      mergeMap((item) => this.bitstreamDataService.findAllByItemAndBundleName(
          item, 'ORIGINAL', {}, true, true, followLink('format'),
        ).pipe(
          getFirstCompletedRemoteData(),
          switchMap((rd: RemoteData<PaginatedList<Bitstream>>) => rd.hasSucceeded ? rd.payload.page : []),
          mergeMap((bitstream: Bitstream) => bitstream.format.pipe(
            getFirstCompletedRemoteData(),
            filter((bitstreamFormatRD: RemoteData<BitstreamFormat>) =>
              bitstreamFormatRD.hasSucceeded && hasValue(bitstreamFormatRD.payload) && hasValue(bitstream) &&
              bitstreamFormatRD.payload.mimetype.includes('image/')
            ),
            map(() => bitstream)
          )),
          take(1),
          map((bitstream: Bitstream) => [item.uuid, bitstream._links.content.href]),
        ),
      ),
      scan((acc: Map<string, string>, value: [string, string]) => {
        acc.set(value[0], value[1]);
        return acc;
      }, new Map<string, string>()),
    );
  }
}
