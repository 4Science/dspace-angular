import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { Community } from '../../core/shared/community.model';
import { UsageReportDataService } from '../../core/statistics/usage-report-data.service';
import { StatisticsPageComponent } from '../statistics-page/statistics-page.component';

/**
 * Component representing the statistics page for a community.
 */
@Component({
  selector: 'ds-community-statistics-page',
  templateUrl: '../statistics-page/statistics-page.component.html',
  styleUrls: ['./community-statistics-page.component.scss'],
})
export class CommunityStatisticsPageComponent extends StatisticsPageComponent<Community> {

  /**
   * The report types to show on this statistics page.
   */
  types: string[] = [
    'TotalVisits',
    'TotalVisitsPerMonth',
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
