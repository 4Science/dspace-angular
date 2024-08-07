import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';

import {
  APP_CONFIG,
  AppConfig,
} from '../../config/app-config.interface';
import { SearchManager } from '../core/browse/search-manager';
import { RouteService } from '../core/services/route.service';
import { SearchService } from '../core/shared/search/search.service';
import { SearchConfigurationService } from '../core/shared/search/search-configuration.service';
import { SEARCH_CONFIG_SERVICE } from '../my-dspace-page/my-dspace-page.component';
import { pushInOut } from '../shared/animations/push';
import { HostWindowService } from '../shared/host-window.service';
import { SearchComponent } from '../shared/search/search.component';
import { SidebarService } from '../shared/sidebar/sidebar.service';

/**
 * This component renders a search page using a configuration as input.
 */
@Component({
  selector: 'ds-configuration-search-page',
  styleUrls: ['../shared/search/search.component.scss'],
  templateUrl: '../shared/search/search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [pushInOut],
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService,
    },
  ],
})

export class ConfigurationSearchPageComponent extends SearchComponent {
  constructor(@Inject(PLATFORM_ID) public platformId: any,
              @Inject(SEARCH_CONFIG_SERVICE) public searchConfigService: SearchConfigurationService,
              @Inject(APP_CONFIG) protected appConfig: AppConfig,
              protected service: SearchService,
              protected searchManager: SearchManager,
              protected sidebarService: SidebarService,
              protected windowService: HostWindowService,
              protected routeService: RouteService,
              protected router: Router,
  ) {
    super(platformId, searchConfigService, appConfig, service, searchManager, sidebarService, windowService, routeService, router);
  }
}
