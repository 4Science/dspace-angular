import {
  Component,
  Inject,
} from '@angular/core';

import {
  APP_CONFIG,
  AppConfig,
} from '../../config/app-config.interface';
import { SearchConfigurationService } from '../core/shared/search/search-configuration.service';
import { ViewMode } from '../core/shared/view-mode.model';
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
   * The initial view mode used to render the search results, based on the preferred display view configuration.
   */
  initViewMode: ViewMode;

  constructor(@Inject(APP_CONFIG) protected appConfig: AppConfig) {
    this.initViewMode = this.appConfig.search?.preferredDisplayView?.searchPage ?? ViewMode.ListElement;
  }
}
