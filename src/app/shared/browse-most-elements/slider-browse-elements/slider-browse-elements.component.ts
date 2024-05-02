import { Component, inject, OnChanges, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription, switchMap } from 'rxjs';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';
import { BitstreamImagesService } from '../../../core/services/bitstream-images.service';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { map, tap } from 'rxjs/operators';
import { Item } from 'src/app/core/shared/item.model';

@Component({
  selector: 'ds-slider-browse-elements',
  templateUrl: './slider-browse-elements.component.html',
  styleUrls: ['./slider-browse-elements.component.scss'],
})
export class SliderBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit, OnChanges {

  maxItemsPerPage = 4;

  private bitstreamImagesService = inject(BitstreamImagesService);

  itemToImageHrefMap$: Observable<Map<string, string>>;

  selectedSearchResultArray$: Observable<DSpaceObject[]>;

  totalItemsBS = new BehaviorSubject<number>(0);

  firstItemBS = new BehaviorSubject<number>(0);

  itemsPerPageBS = new BehaviorSubject<number>(this.maxItemsPerPage);

  ngOnInit() {
    super.ngOnInit();

    this.itemToImageHrefMap$ = this.searchResultArray$.pipe(
      switchMap((res) => this.bitstreamImagesService.getItemToImageMap(res as Item[])),
    );

    this.selectedSearchResultArray$ = combineLatest([
      this.searchResultArray$, this.firstItemBS.asObservable(),
    ]).pipe(
      tap(([items, firstItem]) => {
        console.log('SELECTED', items.length, firstItem);
        this.totalItemsBS.next(items.length);
      }),
      map(([items, firstItem]) => items.slice(firstItem, firstItem + 4)),
    );
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
}
