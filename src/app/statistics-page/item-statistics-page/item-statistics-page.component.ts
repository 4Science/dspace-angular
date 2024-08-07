import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { Item } from '../../core/shared/item.model';
import { UsageReportDataService } from '../../core/statistics/usage-report-data.service';
import { StatisticsPageComponent } from '../statistics-page/statistics-page.component';

/**
 * Component representing the statistics page for an item.
 */
@Component({
  selector: 'ds-item-statistics-page',
  templateUrl: '../statistics-page/statistics-page.component.html',
  styleUrls: ['./item-statistics-page.component.scss'],
})
export class ItemStatisticsPageComponent extends StatisticsPageComponent<Item> {

  /**
   * The report types to show on this statistics page.
   */
  types: string[] = [
    'TotalVisits',
    'TotalVisitsPerMonth',
    'TotalDownloads',
    'TopCountries',
    'TopCities',
  ];

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected usageReportService: UsageReportDataService,
    protected nameService: DSONameService,
    protected authService: AuthService,
  ) {
    super(
      route,
      router,
      usageReportService,
      nameService,
      authService,
    );
  }
}
