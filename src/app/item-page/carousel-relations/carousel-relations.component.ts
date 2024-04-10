import { PaginatedSearchOptions } from './../../shared/search/models/paginated-search-options.model';
import { SortDirection } from './../../core/cache/models/sort-options.model';
import { SearchConfig } from './../../core/shared/search/search-filters/search-config.model';
import { NativeWindowRef, NativeWindowService } from 'src/app/core/services/window.service';
import { BitstreamDataService } from './../../core/data/bitstream-data.service';
import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { SearchManager } from '../../core/browse/search-manager';
import { SEARCH_CONFIG_SERVICE } from '../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { CarouselOptions } from '../../shared/carousel/carousel-options.model';
import { SliderComponent } from 'src/app/shared/slider/slider.component';
import { BitstreamImagesService } from 'src/app/core/data/bitstream-images.service';

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
export class CarouselRelationsComponent extends SliderComponent implements OnInit {

  @Input() header: string;

  @Input() scope: string;

  @Input() discoveryConfiguration: string;

  pageSize = 4;

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

  constructor(
    @Inject(SEARCH_CONFIG_SERVICE) private searchConfigService: SearchConfigurationService,
    protected bitstreamDataService: BitstreamDataService,
    protected bitstreamImagesService: BitstreamImagesService,
    protected cdr: ChangeDetectorRef,
    protected searchManager: SearchManager,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
  ) {
    super(bitstreamDataService, bitstreamImagesService, cdr, searchManager, _window);
  }


  ngOnInit(): void {
    this.searchConfigService.getConfigurationSearchConfig(this.discoveryConfiguration, this.scope).subscribe((searchConfig: SearchConfig) => {
      this.sortField = searchConfig.sortOptions[0]?.name ?? 'lastModified';
      this.sortOrder = searchConfig.sortOptions[0]?.sortOrder ?? SortDirection.DESC;
      this.numberOfItems = this.pageSize;
      this.paginatedSearchOptions = new PaginatedSearchOptions({
        scope: this.scope,
      });
      super.ngOnInit();
    });
  }
}
