import {
  AsyncPipe,
  isPlatformBrowser,
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  switchMap,
} from 'rxjs';
import {
  map,
  tap,
} from 'rxjs/operators';
import { Item } from 'src/app/core/shared/item.model';

import { BitstreamImagesService } from '../../../core/services/bitstream-images.service';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { BtnDisabledDirective } from '../../btn-disabled.directive';
import { hasValue } from '../../empty.util';
import { ThemedTypeBadgeComponent } from '../../object-collection/shared/badges/type-badge/themed-type-badge.component';
import { BackgroundImageDirective } from '../../utils/background-image.directive';
import { VarDirective } from '../../utils/var.directive';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';

@Component({
  selector: 'ds-base-slider-browse-elements',
  templateUrl: './slider-browse-elements.component.html',
  styleUrls: ['./slider-browse-elements.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    BtnDisabledDirective,
    NgForOf,
    BackgroundImageDirective,
    ThemedTypeBadgeComponent,
    NgxSkeletonLoaderModule,
    TranslateModule,
    RouterLink,
    NgClass,
    NgbTooltipModule,
    VarDirective,
  ],
})
export class SliderBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  readonly maxItemsPerPage = 4;
  readonly minCardWidth = 250;
  readonly arrowSpace = 132; // total width of arrow columns (including gaps)
  readonly cardGap = 16; // corresponding to gapx-3

  protected followThumbnailLink = false; // not required as ORIGINAL bundle is used
  protected followMetricsLink = false;

  private readonly bitstreamImagesService = inject(BitstreamImagesService);

  itemToImageHrefMap$: Observable<Map<string, string>>;

  selectedSearchResultArray$: Observable<DSpaceObject[]>;

  totalItemsBS = new BehaviorSubject<number>(0);

  firstItemBS = new BehaviorSubject<number>(0);

  itemsPerPageBS = new BehaviorSubject<number>(this.maxItemsPerPage);

  resizeObserver: ResizeObserver;

  sliderWrapperElement: Element;

  @ViewChild('sliderWrapper') sliderWrapperElementRef: ElementRef;

  ngOnInit() {
    super.ngOnInit();

    this.itemToImageHrefMap$ = this.searchResultArray$.pipe(
      switchMap((res) => this.bitstreamImagesService.getItemToImageMap(res as Item[])),
    );

    this.selectedSearchResultArray$ = combineLatest([
      this.searchResultArray$, this.firstItemBS.asObservable(),
    ]).pipe(
      tap(([items, firstItem]) => {
        this.totalItemsBS.next(items.length);
      }),
      map(([items, firstItem]) => items.slice(firstItem, firstItem + this.itemsPerPageBS.value)),
    );

    if (isPlatformBrowser(this.platformId)) {
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const containerWidth = entry.contentRect.width;
          const maxFittingCards = Math.max(Math.floor((containerWidth - this.arrowSpace + this.cardGap) / (this.minCardWidth + this.cardGap)), 1);
          this.itemsPerPageBS?.next(Math.min(this.maxItemsPerPage, maxFittingCards));
          this.firstItemBS?.next(0); // reset when screen width changes
        });
      });
    }
  }

  next() {
    this.firstItemBS.next(this.firstItemBS.value + this.itemsPerPageBS.value);
  }

  prev() {
    this.firstItemBS.next(this.firstItemBS.value - this.itemsPerPageBS.value);
  }

  ngOnChanges() {
    super.ngOnChanges();
    this.firstItemBS?.next(0); // reset when input data change
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.sliderWrapperElement = this.sliderWrapperElementRef.nativeElement;
      this.resizeObserver.observe(this.sliderWrapperElement);
    }
  }

  ngOnDestroy() {
    if (hasValue(this.resizeObserver)) {
      this.resizeObserver.unobserve(this.sliderWrapperElement);
    }
  }

}
