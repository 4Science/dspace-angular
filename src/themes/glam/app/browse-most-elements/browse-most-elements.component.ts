import { ChangeDetectorRef, Component } from '@angular/core';
import { getItemPageRoute } from '../../../../app/item-page/item-page-routing-paths';
import { BrowseMostElementsComponent as BaseComponent } from '../../../../app/shared/browse-most-elements/browse-most-elements.component';
import { BehaviorSubject, from } from 'rxjs';
import { BitstreamDataService } from '../../../../app/core/data/bitstream-data.service';
import { SearchService } from '../../../../app/core/shared/search/search.service';
import { Router } from '@angular/router';
import { followLink } from '../../../../app/shared/utils/follow-link-config.model';
import { getFirstCompletedRemoteData } from '../../../../app/core/shared/operators';
import { RemoteData } from '../../../../app/core/data/remote-data';
import { PaginatedList } from '../../../../app/core/data/paginated-list.model';
import { SearchResult } from '../../../../app/shared/search/models/search-result.model';
import { DSpaceObject } from '../../../../app/core/shared/dspace-object.model';
import { filter, map, mergeMap, scan, switchMap, take } from 'rxjs/operators';
import { Item } from '../../../../app/core/shared/item.model';
import { Bitstream } from '../../../../app/core/shared/bitstream.model';
import { BitstreamFormat } from '../../../../app/core/shared/bitstream-format.model';
import { hasValue } from '../../../../app/shared/empty.util';


@Component({
  selector: 'ds-browse-most-elements',
  styleUrls: ['./browse-most-elements.component.scss'],
  templateUrl: './browse-most-elements.component.html',
})
export class BrowseMostElementsComponent extends BaseComponent {

  itemToImageHrefMap$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

  constructor(
    protected searchService: SearchService,
    protected cdr: ChangeDetectorRef,
    protected router: Router,
    private bitstreamDataService: BitstreamDataService
  ) {
    super(searchService, cdr, router);
  }

  protected getSearchResults() {
    this.searchService
      .search(this.paginatedSearchOptions, null, true, true, followLink('thumbnail'))
      .pipe(getFirstCompletedRemoteData())
      .subscribe(
        (response: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
          this.searchResults = response as any;
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
}
