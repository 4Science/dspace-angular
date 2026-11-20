import { AsyncPipe } from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  distinctUntilChanged,
  map,
} from 'rxjs/operators';

import {
  SortDirection,
  SortOptions,
} from '../../../core/cache/models/sort-options.model';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { SEARCH_CONFIG_SERVICE } from '../../../my-dspace-page/my-dspace-configuration.service';
import { PageSizeSelectorComponent } from '../../page-size-selector/page-size-selector.component';
import { SidebarDropdownComponent } from '../../sidebar/sidebar-dropdown.component';

@Component({
  selector: 'ds-base-search-settings',
  styleUrls: ['./search-settings.component.scss'],
  templateUrl: './search-settings.component.html',
  imports: [
    AsyncPipe,
    FormsModule,
    PageSizeSelectorComponent,
    SidebarDropdownComponent,
    TranslateModule,
  ],
})

/**
 * This component represents the part of the search sidebar that contains the general search settings.
 */
export class SearchSettingsComponent implements OnInit {
  /**
   * The current sort option used
   */
  @Input() currentSortOption: SortOptions;

  /**
   * All sort options that are shown in the settings
   */
  @Input() sortOptionsList: SortOptions[];

  /**
   * The initial view mode, used as the active view mode when no `view` query parameter is set.
   */
  @Input() initViewMode: ViewMode = ViewMode.ListElement;

  /**
   * The active view mode, used to decide whether the page size selector is shown.
   */
  currentViewMode$: Observable<ViewMode>;

  /**
   * View modes for which the page size selector is hidden. It only hides the selector:
   * the pagination rules are still applied.
   */
  readonly paginationSizeDisallowList: ViewMode[] = [ViewMode.DetailedListElement];

  constructor(
    protected paginationService: PaginationService,
    @Inject(SEARCH_CONFIG_SERVICE) public searchConfigurationService: SearchConfigurationService,
  ) {
  }

  ngOnInit(): void {
    this.currentViewMode$ = this.searchConfigurationService.getCurrentViewMode(this.initViewMode).pipe(
      map((viewMode: string) => viewMode as ViewMode),
      distinctUntilChanged(),
    );
  }

  /**
   * Method to change the current sort field and direction
   * @param {Event} event Change event containing the sort direction and sort field
   */
  reloadOrder(event: Event) {
    const values = (event.target as HTMLInputElement).value.split(',');
    this.paginationService.updateRoute(this.searchConfigurationService.paginationID, {
      sortField: values[0],
      sortDirection: values[1] as SortDirection,
      page: 1,
    });
  }
}
