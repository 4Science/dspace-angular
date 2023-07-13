import {Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild} from '@angular/core';
import {BitstreamDataService, MetadataFilter} from '../../../core/data/bitstream-data.service';
import {FindListOptions} from '../../../core/data/find-list-options.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {buildPaginatedList, PaginatedList} from '../../../core/data/paginated-list.model';
import {Bitstream} from '../../../core/shared/bitstream.model';
import {getFirstCompletedRemoteData} from '../../../core/shared/operators';
import {map, mergeMap, toArray} from 'rxjs/operators';
import {followLink} from '../../utils/follow-link-config.model';
import {isNotEmpty} from '../../empty.util';
import {MediaSelectionBarItem} from './media-selection-bar-item.model';

@Component({
  selector: 'ds-media-selection-bar',
  templateUrl: './media-selection-bar.component.html',
  styleUrls: ['./media-selection-bar.component.scss']
})
export class MediaSelectionBarComponent implements OnChanges {
  /**
   * The item uuid
   */
  @Input() itemUUID: string;

  /**
   * If given, the uuid of the preload bitstream to load selection thumbnails
   */
  @Input() startUUID: string;

  /**
   * If given, the new current item to load selection thumbnails
   */
  @Input() currentItem: any;

  /**
   * If the list has more elements to load
   */
  hasMoreElements = false;

  /**
   * Pagination configuration object
   */
  pageOptions: FindListOptions;

  /**
   * The list of MediaSelectionThumbnails to show in the media section bar
   */
  mediaSelectionItemList$: BehaviorSubject<MediaSelectionBarItem[]> = new BehaviorSubject<MediaSelectionBarItem[]>([]);

  /**
   * The bundle name according current itemUUID
   */
  bundleName: string;

  /**
   * The current selected Bitstream UUID
   */
  selectedMediaItemUUID$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  /**
   * An event emitted when a Selection bar element with timestamp is selected
   */
  @Output() selectItem: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('thumbs') thumbs: ElementRef;

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    this.thumbs.nativeElement.scrollLeft += delta * 50;
  }

  constructor(protected bitstreamDataService: BitstreamDataService) {
  }
  ngOnChanges(): void {
    this.pageOptions = {
      elementsPerPage: 5,
      currentPage: 1
    };

    this.selectedMediaItemUUID$.next(this.currentItem.bitstream?.id ? this.currentItem.bitstream?.id : this.startUUID);
    if (this.thumbs) {
      this.thumbs.nativeElement.scrollLeft = 0;
    }
    this.bundleName = 'SCENES-THUMBNAIL-' + this.selectedMediaItemUUID$.value;

    this.mediaSelectionItemList$ = new BehaviorSubject<MediaSelectionBarItem[]>([]);
    this.hasMoreElements = false;

    this.buildSelectionList(isNotEmpty(this.selectedMediaItemUUID$.value)).subscribe((list: MediaSelectionBarItem[]) => {
      this.mediaSelectionItemList$.next([...this.mediaSelectionItemList$.value, ...list]);
    });
  }

  /**
   * Retrieve more selection bar element on scroll
   */
  onScrollDown() {
    if (this.hasMoreElements) {
      this.pageOptions.currentPage++;
      this.buildSelectionList(false).subscribe((list: MediaSelectionBarItem[]) => {
        this.mediaSelectionItemList$.next([...this.mediaSelectionItemList$.value, ...list]);
      });
    }
  }

  /**
   * Retrieve bitstream related to the item
   *
   * @param isStartUUIDPresent If true it continues to retrieve the bitstream until the bitstream with startUUID is not found
   * @private
   */
  private retrieveBitstreams(isStartUUIDPresent: boolean): Observable<PaginatedList<Bitstream>> {
    const filters: MetadataFilter[] = [];
    return this.bitstreamDataService.findShowableBitstreamsByItem(
      this.itemUUID,
      this.bundleName,
      filters,
      this.pageOptions,
      true,
      true,
      followLink('thumbnail'),
      followLink('format')
    ).pipe(
      getFirstCompletedRemoteData(),
      map((response) => {
        return response.hasSucceeded ? response.payload : buildPaginatedList(null, []);
      }),
      mergeMap((bitstreamList: PaginatedList<Bitstream>) => {
          this.hasMoreElements = this.pageOptions.currentPage !== bitstreamList?.pageInfo?.totalPages;
          return of(bitstreamList);
        })
    );
   }

  /**
   * Generate a list of Selection items by retrieving the bitstream
   *
   * @param isStartUUIDPresent If true it continues to retrieve the bitstream until the bitstream with startUUID is not found
   * @private
   */
  private buildSelectionList(isStartUUIDPresent: boolean): Observable<MediaSelectionBarItem[]> {
    return this.retrieveBitstreams(isStartUUIDPresent).pipe(
      mergeMap((bitstreamList: PaginatedList<Bitstream>) => {
        return bitstreamList.page;
      }),
      mergeMap((bitstream: Bitstream) => this.createMediaSelectionItem(bitstream)),
      toArray()
    );
  }

  /**
   * Emit the selectItem event
   *
   * @param item
   */
  emitSelectItem(item: MediaSelectionBarItem) {
    this.selectItem.emit(item.sceneTimestamp);
  }

  /**
   * Create MediaSelectionBarItem
   *
   * @param bitstream
   */
  private createMediaSelectionItem(bitstream: Bitstream): Observable<MediaSelectionBarItem> {
    const selectionBarItem = new MediaSelectionBarItem();
    selectionBarItem.bitstream = bitstream;
    selectionBarItem.thumbnail = bitstream._links.content.href;
    selectionBarItem.sceneTimestamp = Number(bitstream.allMetadataValues('bitstream.scene.timestamp')[0]);
    return of(selectionBarItem);
  }
}
