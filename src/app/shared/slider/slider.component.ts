import { Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { filter, map, mergeMap, scan, switchMap, take, takeUntil } from 'rxjs/operators';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { BitstreamFormat } from '../../core/shared/bitstream-format.model';
import { Bitstream } from '../../core/shared/bitstream.model';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { hasValue } from '../empty.util';
import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';
import { followLink } from '../utils/follow-link-config.model';
import { RemoteData } from '../../core/data/remote-data';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export interface SliderOptions {
  header?: string;
}

export const defaultSliderOptions = {
  header: ''
};

/**
 * Component representing the Slider component section.
 */
@Component({
  selector: 'ds-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnInit, OnDestroy {
  /**
   * Items to be used in slider.
   */
  @Input() items: ItemSearchResult[];

  @Input() sliderOptions: SliderOptions = defaultSliderOptions;

  /**
   * Slider section title field.
   */
  title = 'dc.title';

  /**
   * Slider section link field.
   */
  link = 'cris.news.url';

  /**
   * Slider section description field.
   */
  description: string;

  itemToImageHrefMap$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

  isLoading$ = new BehaviorSubject(true);

  private destroyed = new Subject<void>();

  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  currentScreenSize?: string;
  currentPage = 1;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
    @Optional() protected breakpointObserver?: BreakpointObserver,
  ) {
  }

  ngOnInit() {
    this.findAllBitstreamImages().subscribe((res) => {
      console.log('itemToImageHrefMap$', res);
      this.itemToImageHrefMap$.next(res);
    });

    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.currentScreenSize = this.displayNameMap.get(query) ?? 'Unknown';
          }
        }
      });
  }

  /**
   * Find the first image of each item
   */
  findAllBitstreamImages(): Observable<Map<string, string>> {
    return from(this.items).pipe(
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

  get cardsPerPage() { // based on screen size
    const mapping: Record<string, number> = {
      XSmall: 2,
      Small: 3,
      Medium: 4,
      Large: 5,
      XLarge: 6,
    };

    return mapping[this.currentScreenSize ?? 'XSmall'];
  }

  currentPageItems() {
    return this.items.slice((this.currentPage - 1) * this.cardsPerPage, this.currentPage * this.cardsPerPage);
  }

  pages = () => {
    return Array.from({length: Math.ceil(this.items.length / this.cardsPerPage)}, (_, i) => i + 1);
  };

  previousPage = () => {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  };

  nextPage = () => {
    if (this.currentPage < this.pages().length) {
      this.currentPage++;
    }
  };

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
