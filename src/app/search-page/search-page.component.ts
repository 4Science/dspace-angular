import { Component, Inject } from '@angular/core';
import { SEARCH_CONFIG_SERVICE } from '../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../core/shared/search/search-configuration.service';
import { APP_CONFIG, AppConfig } from '../../config/app-config.interface';
import { ViewMode } from '../core/shared/view-mode.model';

@Component({
  selector: 'ds-search-page',
  templateUrl: './search-page.component.html',
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ]
})
/**
 * This component represents the whole search page
 * It renders search results depending on the current search options
 */
export class SearchPageComponent {

  /**
   * The initial view mode used to render the search results, based on the preferred display view configuration.
   */
  initViewMode: ViewMode;

  constructor(@Inject(APP_CONFIG) protected appConfig: AppConfig) {
    this.initViewMode = this.appConfig.search?.preferredDisplayView?.searchPage ?? ViewMode.ListElement;
  }
}
