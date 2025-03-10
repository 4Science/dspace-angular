import {
  Directive,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';

import { AuthService } from '../../core/auth/auth.service';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { RemoteData } from '../../core/data/remote-data';
import { redirectOn4xx } from '../../core/shared/authorized.operators';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import {
  getFirstSucceededRemoteData,
  getRemoteDataPayload,
} from '../../core/shared/operators';
import { UsageReport } from '../../core/statistics/models/usage-report.model';
import { UsageReportDataService } from '../../core/statistics/usage-report-data.service';

@Directive()
/**
 * Class representing an abstract statistics page component.
 */
export abstract class StatisticsPageDirective<T extends DSpaceObject> {

  /**
   * The scope dso for this statistics page, as an Observable.
   */
  scope$: Observable<DSpaceObject>;

  /**
   * The report types to show on this statistics page.
   */
  types: string[];

  /**
   * The usage report types to show on this statistics page, as an Observable list.
   */
  reports$: Observable<UsageReport[]>;

  hasData$: Observable<boolean>;

  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected usageReportService = inject(UsageReportDataService);
  protected nameService = inject(DSONameService);
  protected authService = inject(AuthService);

  /**
   * Get the scope dso for this statistics page, as an Observable.
   */
  protected getScope$(): Observable<DSpaceObject> {
    return this.route.data.pipe(
      map((data) => data.scope as RemoteData<T>),
      redirectOn4xx(this.router, this.authService),
      getFirstSucceededRemoteData(),
      getRemoteDataPayload(),
    );
  }

  /**
   * Get the usage reports for this statistics page, as an Observable list
   */
  protected getReports$(): Observable<UsageReport[]> {
    return this.scope$.pipe(
      switchMap((scope) =>
        combineLatest(
          this.types.map((type) => this.usageReportService.getStatistic(scope.id, type)),
        ),
      ),
    );
  }

  /**
   * Get the name of the scope dso.
   * @param scope the scope dso to get the name for
   */
  getName(scope: DSpaceObject): string {
    return this.nameService.getName(scope);
  }
}
