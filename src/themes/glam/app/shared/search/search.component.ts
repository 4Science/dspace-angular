import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { ItemExportModalLauncherComponent } from '../../../../../app/shared/search/item-export/item-export-modal-launcher/item-export-modal-launcher.component';
import { SearchComponent as BaseComponent } from '../../../../../app/shared/search/search.component';
import { SearchChartsComponent } from '../../../../../app/shared/search/search-charts/search-charts.component';
import { SearchLabelsComponent } from '../../../../../app/shared/search/search-labels/search-labels.component';
import { ThemedSearchResultsComponent } from '../../../../../app/shared/search/search-results/themed-search-results.component';
import { ThemedSearchSidebarComponent } from '../../../../../app/shared/search/search-sidebar/themed-search-sidebar.component';
import { ThemedSearchFormComponent } from '../../../../../app/shared/search-form/themed-search-form.component';
import { PageWithSidebarComponent } from '../../../../../app/shared/sidebar/page-with-sidebar.component';
import { ViewModeSwitchComponent } from '../../../../../app/shared/view-mode-switch/view-mode-switch.component';

@Component({
  selector: 'ds-themed-search',
  styleUrls: ['./search.component.scss'],
  templateUrl: './search.component.html',
  standalone: true,
  imports: [
    SearchChartsComponent,
    AsyncPipe,
    PageWithSidebarComponent,
    ViewModeSwitchComponent,
    TranslateModule,
    ThemedSearchResultsComponent,
    ThemedSearchSidebarComponent,
    NgIf,
    NgbTooltipModule,
    ThemedSearchFormComponent,
    ItemExportModalLauncherComponent,
    SearchLabelsComponent,
  ],
})

/**
 * This component renders a sidebar, a search input bar and the search results.
 */
export class SearchComponent extends BaseComponent {}
