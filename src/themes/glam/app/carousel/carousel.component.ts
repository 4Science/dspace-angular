import { Component, OnInit } from '@angular/core';
import { CarouselComponent as BaseComponent} from '../../../../app/shared/carousel/carousel.component';

/**
 * Component representing the Carousel component section.
 */
@Component({
  selector: 'ds-carousel-themed',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  providers: []
})
export class CarouselComponent extends BaseComponent implements OnInit {

  /**
   * Time interval between transitions, in ms
   */
  carouselInterval: 6000;

  carouselHeight: string;

  ngOnInit() {
    super.ngOnInit();
    this.carouselHeight = this.carouselOptions.keepAspectRatio ?
      `calc(100vw / ${ this.carouselOptions.aspectRatio})` : `${this.carouselOptions.carouselHeightPx}px`;
  }

}
