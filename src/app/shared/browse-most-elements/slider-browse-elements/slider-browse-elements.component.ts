import { Component, inject, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';
import { BitstreamImagesService } from '../../../core/services/bitstream-images.service';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { map } from 'rxjs/operators';
import { Item } from 'src/app/core/shared/item.model';

@Component({
  selector: 'ds-slider-browse-elements',
  templateUrl: './slider-browse-elements.component.html',
  styleUrls: ['./slider-browse-elements.component.scss'],
})
export class SliderBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnInit {

  private bitstreamImagesService = inject(BitstreamImagesService);

  itemToImageHrefMap$: Observable<Map<string, string>>;

  selectedSearchResultArray$: Observable<DSpaceObject[]>;

  ngOnInit() {
    super.ngOnInit();

    this.itemToImageHrefMap$ = this.searchResultArray$.pipe(
      switchMap((res) => this.bitstreamImagesService.getItemToImageMap(res)),
    );

    this.selectedSearchResultArray$ = this.searchResultArray$.pipe(
      map((items) => items.slice(0, 2)), // TODO pagination
    );
  }

}
