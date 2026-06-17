import {
  AsyncPipe,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ItemDataService } from '@dspace/core/data/item-data.service';
import { Item } from '@dspace/core/shared/item.model';
import { Metric } from '@dspace/core/shared/metric.model';
import { getFirstSucceededRemoteDataPayload } from '@dspace/core/shared/operators';
import { hasValue } from '@dspace/shared/utils/empty.util';
import { TranslateService } from '@ngx-translate/core';
import {
  BehaviorSubject,
  Subscription,
} from 'rxjs';

import { MetricRowComponent } from '../../../shared/metric/metric-row/metric-row.component';
import { MetricsComponentsService } from '../../../shared/metric/services/metrics-components.service';

/**
 * List of metrics to be displayed
 */
export interface LayoutMetricRow {
  metrics: Metric[];
}

/**
 * Configuration for item page visualization
 */
export interface MetricsBoxConfiguration {
  maxColumns: number | null;
  metrics: string[];
}


/**
 * This component renders the metadata boxes of items
 */
@Component({
  selector: 'ds-metrics-box',
  templateUrl: './metrics-box.component.html',
  styleUrls: ['./metrics-box.component.scss'],
  imports: [
    AsyncPipe,
    MetricRowComponent,
  ],
})
/**
 * For overwrite this component create a new one that extends CrisLayoutBoxObj and
 * add the CrisLayoutBoxModelComponent decorator indicating the type of box to overwrite
 */
export class MetricsBoxComponent implements OnInit, OnDestroy {



  /**
   * Computed metric rows for the item and the current box
   */
  metricRows: BehaviorSubject<LayoutMetricRow[]> = new BehaviorSubject<LayoutMetricRow[]>([]);

  /**
   * true if the item has a thumbnail, false otherwise
   */
  hasThumbnail = false;

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  @Input() item: Item;

  /**
   * Contains the metrics configuration for current box
   */
  @Input() metricsBoxConfiguration: MetricsBoxConfiguration;

  constructor(
    protected metricsComponentService: MetricsComponentsService,
    protected itemService: ItemDataService,
    protected translateService: TranslateService,
    @Inject(PLATFORM_ID) protected platformId: any,
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.subs.push(
        this.itemService.getMetrics(this.item.uuid).pipe(
          getFirstSucceededRemoteDataPayload(),
        ).subscribe((result) => {
          const matchingMetrics = this.metricsComponentService.getMatchingMetrics(
            result.page,
            this.metricsBoxConfiguration.maxColumns,
            this.metricsBoxConfiguration.metrics,
          );
          this.metricRows.next(matchingMetrics);
        },
        ),
      );
    }
  }

  /**
   * Unsubscribes all subscriptions
   */
  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }
}
