import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { SearchComponent } from '../../shared/search/search.component';
import { SearchService } from '../../core/shared/search/search.service';
import { SearchManager } from '../../core/browse/search-manager';
import { SidebarService } from '../../shared/sidebar/sidebar.service';
import { HostWindowService } from '../../shared/host-window.service';
import { SEARCH_CONFIG_SERVICE } from '../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { RouteService } from '../../core/services/route.service';
import { Router } from '@angular/router';
import { CarouselOptions } from '../../shared/carousel/carousel-options.model';
import { APP_CONFIG, AppConfig } from '../../../config/app-config.interface';

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
export class CarouselRelationsComponent extends SearchComponent {

  @Input() header: string;

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

  constructor(protected service: SearchService,
              protected searchManager: SearchManager,
              protected sidebarService: SidebarService,
              protected windowService: HostWindowService,
              @Inject(PLATFORM_ID) public platformId: any,
              @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService,
              protected routeService: RouteService,
              protected router: Router,
              @Inject(APP_CONFIG) protected appConfig: AppConfig,) {
    super(service, searchManager, sidebarService, windowService, platformId, searchConfigService, routeService, router, appConfig);
  }

}
