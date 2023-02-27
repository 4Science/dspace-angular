import { Component, OnInit } from '@angular/core';
import { SEARCH_CONFIG_SERVICE } from '../../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { CarouselComponent } from '../carousel.component';

@Component({
  selector: 'ds-carousel-with-thumbnails',
  templateUrl: './carousel-with-thumbnails.component.html',
  styleUrls: ['./carousel-with-thumbnails.component.scss']
})
export class CarouselWithThumbnailsComponent extends CarouselComponent implements OnInit {
}
