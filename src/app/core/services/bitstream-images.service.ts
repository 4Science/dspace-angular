import { inject, Injectable } from '@angular/core';

import { from, Observable } from 'rxjs';
import { filter, map, mergeMap, reduce, switchMap, take } from 'rxjs/operators';

import { followLink } from '../../shared/utils/follow-link-config.model';
import { getFirstCompletedRemoteData } from '../shared/operators';
import { RemoteData } from '../data/remote-data';
import { PaginatedList } from '../data/paginated-list.model';
import { Bitstream } from '../shared/bitstream.model';
import { BitstreamFormat } from '../shared/bitstream-format.model';
import { hasValue } from '../../shared/empty.util';
import { BitstreamDataService } from '../data/bitstream-data.service';
import { Item } from '../shared/item.model';
import { DSpaceObject } from '../shared/dspace-object.model';

interface ItemAndImage {
  itemUUID: string;
  imageHref: string;
}

@Injectable({ providedIn: 'root' })
export class BitstreamImagesService {

  private readonly bitstreamDataService = inject(BitstreamDataService);

  /**
   * Retrieve all items and their image bitstreams
   * @param items
   * @param bundleName
   */
  getItemToImageMap(items: Item[], bundleName = 'ORIGINAL'): Observable<Map<string, string>> {
    return from(items).pipe(
      mergeMap((item) => this.findImageBitstreams(item, bundleName).pipe(
        take(1),
        map((bitstream: Bitstream) => <ItemAndImage>{
          itemUUID: item.uuid, imageHref: bitstream._links.content.href
        }),
      )),
      reduce((acc: Map<string, string>, value: ItemAndImage) => {
        acc.set(value.itemUUID, value.imageHref);
        return acc;
      }, new Map<string, string>()),
    );
  }

  /**
   * Find all image bitstreams for an item
   * @param item the item for which the images should be retrieved
   * @param bundleName the bundle name (ORIGINAL by default)
   */
  findImageBitstreams(item: Item | DSpaceObject, bundleName = 'ORIGINAL') {
    const isImageMimetypeRegex = /^image\//;

    // retrieve all bundle's bitstreams for the item
    const bitstreamPayload$: Observable<Bitstream> = this.bitstreamDataService.showableByItem(
      item.uuid, bundleName, [], {}, true, true, followLink('format'),
    ).pipe(
      getFirstCompletedRemoteData(),
      switchMap((rd: RemoteData<PaginatedList<Bitstream>>) => rd.hasSucceeded ? rd.payload.page : new Array<Bitstream>()),
    );

    // filter bitstreams according to mime type
    return bitstreamPayload$.pipe(
      switchMap((bitstream: Bitstream) => bitstream.format.pipe(
        getFirstCompletedRemoteData(),
        filter((bitstreamFormatRD: RemoteData<BitstreamFormat>) =>
          bitstreamFormatRD.hasSucceeded && hasValue(bitstreamFormatRD.payload) && hasValue(bitstream) &&
          isImageMimetypeRegex.test(bitstreamFormatRD.payload.mimetype)
        ),
        map(() => bitstream)
      )),
    );
  }
}
