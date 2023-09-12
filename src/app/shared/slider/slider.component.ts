import { Component, Inject, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { NativeWindowRef, NativeWindowService } from '../../core/services/window.service';
import { ItemSearchResult } from '../object-collection/shared/item-search-result.model';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BitstreamImagesService } from '../../core/data/bitstream-images.service';
import { SliderSection } from '../../core/layout/models/section.model';

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

  @Input() sliderSection: SliderSection;

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
    private bitstreamImagesService: BitstreamImagesService,
    @Inject(NativeWindowService) private _window: NativeWindowRef,
    @Optional() protected breakpointObserver?: BreakpointObserver,
  ) {
  }

  ngOnInit() {
    this.bitstreamImagesService.findAllBitstreamImages(this.items)
      .pipe(take(1))
      .subscribe(this.itemToImageHrefMap$);

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
