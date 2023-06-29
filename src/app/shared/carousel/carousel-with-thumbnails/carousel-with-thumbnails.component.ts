import { Component, OnInit } from '@angular/core';
import { CarouselComponent } from '../carousel.component';
import { NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { ItemSearchResult } from '../../object-collection/shared/item-search-result.model';

@Component({
  selector: 'ds-carousel-with-thumbnails',
  templateUrl: './carousel-with-thumbnails.component.html',
  styleUrls: ['./carousel-with-thumbnails.component.scss']
})
export class CarouselWithThumbnailsComponent extends CarouselComponent implements OnInit {

  activeItem: ItemSearchResult;
  activeItemIndex: number;

  placeholderSrc = 'assets/images/replacement_image.svg';

  ngOnInit() {
    super.ngOnInit();
    this.activeItemIndex = 0;
    this.activeItem = this.items[this.activeItemIndex];
  }

  onSlide(slideEvent: NgbSlideEvent) {
    this.activeItemIndex = +slideEvent.current.split('ngb-slide-')[1];
    this.activeItem = this.items[this.activeItemIndex];
  }

  setActiveItem(i: number) {
    this.carousel.select('ngb-slide-' + i);
    this.carousel.pause();
  }
}
