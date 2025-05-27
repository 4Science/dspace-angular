import {
  Component,
  Input,
} from '@angular/core';

import { CarouselOptions } from '../../shared/carousel/carousel-options.model';

@Component({
  selector: 'ds-carousel-relations',
  templateUrl: './carousel-relations.component.html',
  styleUrls: ['./carousel-relations.component.scss'],
})
export class CarouselRelationsComponent {

  @Input() header: string;

  @Input() scope: string;

  @Input() discoveryConfiguration: string;

  carouselOptions: CarouselOptions = {
    aspectRatio: undefined,
    captionStyle: '',
    carouselHeightPx: 680,
    description: 'dc.description.abstract',
    fitHeight: false,
    fitWidth: false,
    keepAspectRatio: false,
    link: 'dc.identifier.uri',
    targetBlank: false,
    title: 'dc.title',
    titleStyle: '',
    showBlurryBackdrop: false,
    bundle: 'ORIGINAL',
  };
}
