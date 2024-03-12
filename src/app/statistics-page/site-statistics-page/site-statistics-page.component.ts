import { Component } from '@angular/core';
import { StatisticsPageDirective } from '../statistics-page/statistics-page.directive';
import { Site } from '../../core/shared/site.model';
import { switchMap } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { StatisticsTableComponent } from '../statistics-table/statistics-table.component';
import { ThemedLoadingComponent } from '../../shared/loading/themed-loading.component';
import { CommonModule } from '@angular/common';
import { VarDirective } from '../../shared/utils/var.directive';
import { SiteDataService } from '../../core/data/site-data.service';

/**
 * Component representing the site-wide statistics page.
 */
@Component({
  selector: 'ds-site-statistics-page',
  templateUrl: '../statistics-page/statistics-page.component.html',
  styleUrls: ['./site-statistics-page.component.scss'],
  standalone: true,
  imports: [CommonModule, VarDirective, ThemedLoadingComponent, StatisticsTableComponent, TranslateModule],
})
export class SiteStatisticsPageComponent extends StatisticsPageDirective<Site> {

  /**
   * The report types to show on this statistics page.
   */
  types: string[] = [
    'TotalVisits',
  ];

  constructor(protected siteService: SiteDataService) {
    super();
  }

  protected getScope$() {
    return this.siteService.find();
  }

  protected getReports$() {
    return this.scope$.pipe(
      switchMap((scope) =>
        this.usageReportService.searchStatistics(scope._links.self.href, 0, 10),
      ),
    );
  }
}
