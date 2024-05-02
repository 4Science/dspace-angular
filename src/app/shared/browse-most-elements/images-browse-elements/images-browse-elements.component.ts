import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';
import { map, Observable, switchMap } from 'rxjs';
import { BitstreamImagesService } from '../../../core/services/bitstream-images.service';
import { Item } from '../../../core/shared/item.model';

@Component({
  selector: 'ds-images-browse-elements',
  templateUrl: './images-browse-elements.component.html',
  styleUrls: ['./images-browse-elements.component.scss'],
})
export class ImagesBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit {

  /**
   * Images with height/width ratio below this value are considered to be square
   */
  maxSquareRatio = 1.3;

  private bitstreamImagesService = inject(BitstreamImagesService);

  itemToImageHrefMap$: Observable<Map<string, string>>;

  selectedSearchResultArray$: Observable<DSpaceObject[]>;

  totalElements$: Observable<number>;

  ngOnInit() {
    super.ngOnInit();

    this.itemToImageHrefMap$ = this.searchResultArray$.pipe(
      switchMap((res) => this.bitstreamImagesService.getItemToImageMap(res as Item[])),
    );

    this.selectedSearchResultArray$ = this.searchResultArray$.pipe(
      map((items) => items.slice(0, 2)), // TODO pagination
    );

    this.totalElements$ = this.searchResults$.pipe(
      map((searchResults) => searchResults?.payload?.pageInfo?.totalElements)
    );
  }

}
