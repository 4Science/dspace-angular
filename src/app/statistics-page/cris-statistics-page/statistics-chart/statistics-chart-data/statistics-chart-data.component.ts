import {
  DOCUMENT,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  Observable,
  of,
} from 'rxjs';

import { ChartData } from '../../../../charts/models/chart-data';
import { ChartSeries } from '../../../../charts/models/chart-series';
import { ChartType } from '../../../../charts/models/chart-type';
import {
  ExportImageType,
  ExportService,
} from '../../../../core/export-service/export.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../../../../core/services/window.service';
import { REPORT_DATA } from '../../../../core/statistics/data-report.service';
import {
  Point,
  UsageReport,
} from '../../../../core/statistics/models/usage-report.model';

@Component({
  selector: 'ds-search-chart-filter',
  template: ``,
})
/**
 * Component that is being injected by wrapper and obtains the report information
 */
export abstract class StatisticsChartDataComponent implements OnInit {

  /**
   * For the ChartType
   */
  chartType: any = ChartType;
  /**
   * Used to set width and height of the chart
   */
  view: any[] = null;
  /**
   * Emits an array of ChartSeries with values found for this chart
   */
  results: Observable<ChartSeries[] | ChartData[]>;
  /**
   * Loading utilized for export functions to disable buttons
   */
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Loading utilized for export functions to disable buttons
   */
  isSecondLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**
   * Chart ElementRef
   */
  @ViewChild('chartRef') chartRef: ElementRef;

  protected exportService: ExportService;

  constructor(
    @Inject(REPORT_DATA) public report: UsageReport,
    @Inject('categoryType') public categoryType: string,
    @Inject(PLATFORM_ID) protected platformId: any,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    @Inject(DOCUMENT) protected document: any,
    protected translateService: TranslateService,
  ) {

    /* IMPORTANT
       Due to a problem occurring on SSR with the ExportAsService dependency, which use window object, the service can't be injected.
       So we need to instantiate the class directly based on current the platform */
    if (isPlatformBrowser(this.platformId)) {
      import('../../../../core/export-service/browser-export.service').then((s) => {
        this.exportService = new s.BrowserExportService(this.platformId, this._window, this.document);
      });
    } else {
      import('../../../../core/export-service/server-export.service').then((s) => {
        this.exportService = new s.ServerExportService();
      });
    }
  }

  ngOnInit() {
    this.results = this.getInitData();
  }

  /**
   * Download chart as image in png version.
   */
  downloadPng() {
    this.isLoading.next(false);
    const node = this.chartRef.nativeElement;
    this.exportService.exportAsImage(node, ExportImageType.png, this.getReportName(), this.isLoading);
  }

  /**
   * Download chart as image in jpeg version.
   */
  downloadJpeg() {
    this.isSecondLoading.next(false);
    const node = this.chartRef.nativeElement;
    this.exportService.exportAsImage(node, ExportImageType.jpeg, this.getReportName(), this.isSecondLoading);
  }

  /**
   * Export the table information in excel mode.
   */
  exportExcel() {
    this.isLoading.next(true);
    this.exportService.exportAsFile('xlsx', 'dataTable', this.getReportName(), true).subscribe(() => {
      this.isLoading.next(false);
    });
  }

  /**
   * Export the table information in csv mode.
   */
  exportCsv() {
    this.isSecondLoading.next(true);
    this.exportService.exportAsFile('csv', 'dataTable', this.getReportName(), true).subscribe(() => {
      this.isSecondLoading.next(false);
    });
  }

  /**
   * The category-aware, translated name of the current report (e.g. "Total downloads per month"
   * for a download report, "Total visits per month" for the equivalent views report), used for
   * chart/table exports and series names so they don't always read as "views".
   */
  protected getReportName(): string {
    return this.translateService.instant('statistics.table.' + this.categoryType + '.title.' + this.report.reportType);
  }

  /**
   * Parse information as needed by charts can be overriden
   */
  protected getInitData(): Observable<ChartSeries[] | ChartData[]> {
    let key = 'views';

    if (this.report.points[0]) {
      key = Object.keys(this.report.points[0].values)[0];
    }

    return of(this.report.points.map(
      (point: Point) => {
        return {
          name: point.label,
          value: point.values[key],
          extra: point,
        };
      }));
  }

}
