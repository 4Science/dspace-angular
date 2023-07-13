import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, mergeMap, toArray } from 'rxjs/operators';
import findIndex from 'lodash/findIndex';

import { BitstreamDataService, MetadataFilter } from '../../../core/data/bitstream-data.service';
import { FindListOptions } from '../../../core/data/find-list-options.model';
import { followLink } from '../../utils/follow-link-config.model';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { RemoteData } from '../../../core/data/remote-data';
import { buildPaginatedList, PaginatedList } from '../../../core/data/paginated-list.model';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { BitstreamFormat } from '../../../core/shared/bitstream-format.model';
import { MediaViewerItem } from '../../../core/shared/media-viewer-item.model';
import { isEmpty, isNotEmpty } from '../../empty.util';

@Component({
  selector: 'ds-media-player-playlist',
  templateUrl: './media-player-playlist.component.html',
  styleUrls: ['./media-player-playlist.component.scss']
})
export class MediaPlayerPlaylistComponent implements OnInit {

  /**
   * The item uuid
   */
  @Input() itemUUID: string;

  /**
   * If given, the uuid of the bitstream to start playing
   */
  @Input() startUUID: string;

  /**
   * Path to alt image
   */
  ALT_IMAGE = 'assets/images/replacement_image.svg';

  /**
   * If the list has more elements to load
   */
  hasMoreElements = false;

  /**
   * The list of MediaViewerItem to show in the playlist
   */
  mediaViewerItemList$: BehaviorSubject<MediaViewerItem[]> = new BehaviorSubject<MediaViewerItem[]>([]);

  /**
   * Pagination configuration object
   */
  pageOptions: FindListOptions;

  /**
   * The current selected Bitstream
   */
  selectedMediaItem: MediaViewerItem;

  /**
   * An event emitted when a playlist element is selected
   */
  @Output() selectItem: EventEmitter<MediaViewerItem> = new EventEmitter<MediaViewerItem>();

  constructor(protected bitstreamDataService: BitstreamDataService) {
  }

  ngOnInit(): void {
    this.pageOptions = {
      elementsPerPage: 10,
      currentPage: 1
    };
    this.buildPlaylist(isNotEmpty(this.startUUID)).subscribe((list: MediaViewerItem[]) => {
      if (isEmpty(this.selectedMediaItem) && isEmpty(this.startUUID)) {
        this.selectedMediaItem = list[0];
      }
      this.emitSelectItem(this.selectedMediaItem);
      this.mediaViewerItemList$.next([...this.mediaViewerItemList$.value, ...list]);
    });
  }

  /**
   * Retrieve more playlist element on scroll
   */
  onScrollDown() {
    if (this.hasMoreElements) {
      this.pageOptions.currentPage++;
      this.buildPlaylist(false).subscribe((list: MediaViewerItem[]) => {
        this.mediaViewerItemList$.next([...this.mediaViewerItemList$.value, ...list]);
      });
    }
  }

  /**
   * Generate a list of MediaViewerItem by retrieving the bitstream
   *
   * @param scrollToGivenUUID If true it continues to retrieve the bitstream until the bitstream with startUUID is not found
   * @private
   */
  private buildPlaylist(scrollToGivenUUID: boolean): Observable<MediaViewerItem[]> {
    const filters: MetadataFilter[] = [{
      metadataName: 'bitstream.category',
      metadataValue: 'media'
    }];

    return this.retrieveBitstreams(scrollToGivenUUID).pipe(
      mergeMap((bitstreamList: PaginatedList<Bitstream>) => {
        return bitstreamList.page;
      }),
      mergeMap((bitstream: Bitstream) => this.createMediaViewerItem(bitstream)),
      toArray()
    );
  }

  /**
   * Retrieve bitstream related to the item
   *
   * @param scrollToGivenUUID If true it continues to retrieve the bitstream until the bitstream with startUUID is not found
   * @private
   */
  private retrieveBitstreams(scrollToGivenUUID: boolean): Observable<PaginatedList<Bitstream>> {
    const filters: MetadataFilter[] = [{
      metadataName: 'bitstream.category',
      metadataValue: 'media'
    }];

    return this.bitstreamDataService.findShowableBitstreamsByItem(
      this.itemUUID,
      'ORIGINAL',
      filters,
      this.pageOptions,
      true,
      true,
      followLink('thumbnail'),
      followLink('format')
    ).pipe(
      getFirstCompletedRemoteData(),
      map((response: RemoteData<PaginatedList<Bitstream>>) => {
        return response.hasSucceeded ? response.payload : buildPaginatedList(null, []);
      }),
      mergeMap((bitstreamList: PaginatedList<Bitstream>) => {
        this.hasMoreElements = this.pageOptions.currentPage !== bitstreamList?.pageInfo?.totalPages;
        if (scrollToGivenUUID && isEmpty(this.selectedMediaItem)) {

          const bitstreamIndex = findIndex(bitstreamList.page, { uuid: this.startUUID });
          if (bitstreamIndex !== -1) {
            return this.createMediaViewerItem(bitstreamList.page[bitstreamIndex]).pipe(
              map((mediaItem: MediaViewerItem) => {
                this.selectedMediaItem = mediaItem;
                return bitstreamList;
              })
            );
          } else if (this.hasMoreElements) {
            this.pageOptions.currentPage++;
            return this.retrieveBitstreams(scrollToGivenUUID).pipe(
              map((bitstreamListRec: PaginatedList<Bitstream>) => {
                return buildPaginatedList(bitstreamListRec.pageInfo, [...bitstreamList.page, ...bitstreamListRec.page]);
              })
            );
          } else {
            return of(bitstreamList);
          }
        } else {
          return of(bitstreamList);
        }
      })
    );
  }


  /**
   * Create an instance of MediaViewerItem by the given bitstream
   *
   * @param bitstream
   * @private
   */
  private createMediaViewerItem(bitstream: Bitstream): Observable<MediaViewerItem> {

    const format$: Observable<BitstreamFormat> = bitstream.format.pipe(
      getFirstCompletedRemoteData(),
      map((formatRD: RemoteData<BitstreamFormat>) => formatRD.hasSucceeded ? formatRD.payload : null)
    );
    const thumbnail$: Observable<Bitstream> = bitstream.thumbnail.pipe(
      getFirstCompletedRemoteData(),
      map((thumbnailRD: RemoteData<Bitstream>) => thumbnailRD.hasSucceeded ? thumbnailRD.payload : null)
    );

    return combineLatest([format$, thumbnail$]).pipe(
      map(([format, thumbnail]) => {
        const mediaItem = new MediaViewerItem();
        mediaItem.bitstream = bitstream;
        mediaItem.name = bitstream.firstMetadataValue('dc.title');
        mediaItem.format = format.mimetype.split('/')[0];
        mediaItem.formatDescription = format.description;
        mediaItem.thumbnail = thumbnail ? thumbnail._links.content.href : null;
        mediaItem.manifestUrl = bitstream.allMetadataValues('dash.manifest')[0];
        return mediaItem;
      }));
  }

  /**
   * Emit the selectItem event
   *
   * @param item
   * @param index
   */
  emitSelectItem(item: MediaViewerItem) {
    this.selectedMediaItem = item;
    this.selectItem.emit(item);
  }

}
