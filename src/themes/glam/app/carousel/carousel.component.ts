import { Component } from '@angular/core';
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
export class CarouselComponent extends BaseComponent {
}
