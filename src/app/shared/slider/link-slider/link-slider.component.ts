import { Item } from '../../../core/shared/item.model';
import { NativeWindowRef, NativeWindowService } from '../../../core/services/window.service';
import { SearchManager } from '../../../core/browse/search-manager';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SliderComponent } from '../slider.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BitstreamImagesService } from 'src/app/core/services/bitstream-images.service';
import { Subject, takeUntil } from 'rxjs';
import { getItemPageRoute } from 'src/app/item-page/item-page-routing-paths';

/**
 * Component representing the Link Slider component section.
 */
@Component({
  selector: 'ds-link-slider',
  templateUrl: './link-slider.component.html',
  styleUrls: ['./link-slider.component.scss'],
})
export class LinkSliderComponent extends SliderComponent implements OnInit, OnDestroy {

  displayNameMap = new Map([
    [Breakpoints.XSmall, 'XSmall'],
    [Breakpoints.Small, 'Small'],
    [Breakpoints.Medium, 'Medium'],
    [Breakpoints.Large, 'Large'],
    [Breakpoints.XLarge, 'XLarge'],
  ]);

  currentScreenSize?: string;

  /**
   * Cleanup subscriptions when component is destroyed
   */
  private destroyed = new Subject<void>();

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    protected cdr: ChangeDetectorRef,
    protected searchManager: SearchManager,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    protected breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) protected platformId: string,
  ) {
    super(bitstreamDataService, bitstreamImagesService, cdr, searchManager, _window, platformId);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.breakpointObserver
      ?.observe([
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
    const mappedSize = mapping[this.currentScreenSize ?? 'XSmall'];
    return (mappedSize <= this.numberOfItems) ? mappedSize : this.numberOfItems;
  }

  getItemLink(item: Item): string {
    if (item) {
      return getItemPageRoute(item);
    }
  }

  currentPageItems(): Item[] {
    return this.itemList.slice((this.currentPage - 1) * this.cardsPerPage, this.currentPage * this.cardsPerPage);
  }

  currentLoadingPageItems(): number[] {
    return this.itemPlaceholderList.slice((this.currentPage - 1) * this.cardsPerPage, this.currentPage * this.cardsPerPage);
  }

  pages = () => {
    return Array.from({length: Math.ceil(this.itemPlaceholderList.length / this.cardsPerPage)}, (_, i) => i + 1);
  };

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  nextPage = () => {
    if (this.currentPage < this.pages().length) {
      if (this.hasMoreToLoad) {
        this.itemsImagesLoading$.next(true);
        this.currentPage++;
        this.retrieveMoreItems(this.currentPage);

      } else {
        this.currentPage++;
      }
    }
  };
}
