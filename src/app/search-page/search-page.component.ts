import {
  Component,
  Inject,
} from '@angular/core';

import {
  APP_CONFIG,
  AppConfig,
} from '../../config/app-config.interface';
import { ContextDisplayConfig } from '../../config/search-page-config.interface';
import { SearchConfigurationService } from '../core/shared/search/search-configuration.service';
import { SEARCH_CONFIG_SERVICE } from '../my-dspace-page/my-dspace-configuration.service';
import { ThemedSearchComponent } from '../shared/search/themed-search.component';

@Component({
  selector: 'ds-base-search-page',
  templateUrl: './search-page.component.html',
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService,
    },
  ],
  standalone: true,
  imports: [ThemedSearchComponent],
})
/**
 * This component represents the whole search page
 * It renders search results depending on the current search options
 */
export class SearchPageComponent {

  /**
   * The preferred search result view configuration for the search page. It defines the initial view
   * mode and the pagination for each view mode, and is passed to the search component.
   */
  searchResultViewConfig: ContextDisplayConfig;

  constructor(@Inject(APP_CONFIG) protected appConfig: AppConfig) {
    this.searchResultViewConfig = this.appConfig.search?.preferredContextConfig?.searchPage;
  }
}
