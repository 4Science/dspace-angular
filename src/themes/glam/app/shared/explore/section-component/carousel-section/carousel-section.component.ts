import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ThemedCarouselComponent } from '../../../../../../../app/shared/carousel/themed-carousel.component';
import { CarouselSectionComponent as BaseComponent } from '../../../../../../../app/shared/explore/section-component/carousel-section/carousel-section.component';
import { ThemedLoadingComponent } from '../../../../../../../app/shared/loading/themed-loading.component';

/**
 * Component representing the Carousel component section.
 */
@Component({
  selector: 'ds-themed-carousel-section',
  templateUrl: './carousel-section.component.html',
  styleUrls: ['./carousel-section.component.scss'],
  providers: [],
  standalone: true,
  imports: [
    ThemedLoadingComponent,
    ThemedCarouselComponent,
    AsyncPipe,
    TranslateModule,
    NgIf,
  ],
})
export class CarouselSectionComponent extends BaseComponent {
}
