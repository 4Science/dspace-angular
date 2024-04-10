import { Component, Input } from '@angular/core';
import { SEARCH_CONFIG_SERVICE } from '../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { CarouselOptions } from '../../shared/carousel/carousel-options.model';

@Component({
  selector: 'ds-carousel-relations',
  templateUrl: './carousel-relations.component.html',
  styleUrls: ['./carousel-relations.component.scss'],
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ]
})
export class CarouselRelationsComponent {

  @Input() header: string;

  @Input() scope: string;

  @Input() discoveryConfiguration: string;

  carouselOptions: CarouselOptions = {
    aspectRatio: undefined,
    captionStyle: '',
    carouselHeightPx: 500,
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
