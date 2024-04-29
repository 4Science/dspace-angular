import { Bitstream } from '../../../core/shared/bitstream.model';
import { Item } from '../../../core/shared/item.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { RemoteData } from '../../../core/data/remote-data';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { Component, inject, OnChanges } from '@angular/core';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';
import { BehaviorSubject, filter, from, map, mergeMap, scan, switchMap, take } from 'rxjs';
import { followLink } from '../../utils/follow-link-config.model';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { SearchResult } from '../../search/models/search-result.model';
import { BitstreamFormat } from '../../../core/shared/bitstream-format.model';
import { hasValue } from '../../empty.util';
import { getItemPageRoute } from '../../../item-page/item-page-routing-paths';

@Component({
  selector: 'ds-image-browse-elements',
  templateUrl: './image-browse-elements.component.html',
  styleUrls: ['./image-browse-elements.component.scss']
})
export class ImageBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnChanges {


  itemToImageHrefMap$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

  /**
   * Images with height/width ratio below this value are considered to be square
   */
  maxSquareRatio = 1.3;

  private readonly bitstreamDataService = inject(BitstreamDataService);

  ngOnChanges() {
    const showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    const followLinks = showThumbnails ? [followLink('thumbnail')] : [];

    this.searchService
      .search(this.paginatedSearchOptions, null, true, true, ...followLinks)
      .pipe(getFirstCompletedRemoteData())
      .subscribe(
        (response: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
          this.totalElements.emit(response.payload?.totalElements ?? 0);
          this.searchResults = response;
          this.getAllBitstreams();
          this.cdr.detectChanges();
        }
      );
  }

  private getAllBitstreams() {
    from(this.searchResults?.payload?.page).pipe(
      map((itemSR) => itemSR.indexableObject),
      mergeMap((item) => this.bitstreamDataService.findAllByItemAndBundleName(
          item as Item, 'ORIGINAL', {}, true, true, followLink('format'),
        ).pipe(
          getFirstCompletedRemoteData(),
          switchMap((rd: RemoteData<PaginatedList<Bitstream>>) => rd.hasSucceeded ? rd.payload.page : []),
          mergeMap((bitstream: Bitstream) => bitstream.format.pipe(
            getFirstCompletedRemoteData(),
            filter((formatRemoteData: RemoteData<BitstreamFormat>) =>
              formatRemoteData.hasSucceeded && hasValue(formatRemoteData.payload) && hasValue(bitstream) &&
              formatRemoteData.payload.mimetype.includes('image/')
            ),
            map(() => bitstream)
          )),
          take(1),
          map((bitstream: Bitstream) => {
            return [item.uuid, bitstream._links.content.href];
          }),
        ),
      ),
      scan((acc: Map<string, string>, value: [string, string]) => {
        acc.set(value[0], value[1]);
        return acc;
      }, new Map<string, string>()),
    ).subscribe((res) => {
      this.itemToImageHrefMap$.next(res);
      this.cdr.detectChanges();
    });
  }

  /**
 * to get the route of the item
 * @param item
 * @returns route to the item as a string
 */
  getItemPageRoute(item) {
    return getItemPageRoute(item);
  }

  get elementsPerPage() {
    return this.searchResults?.payload?.pageInfo?.elementsPerPage ?? 8;
  }
}
