import { Component, Input } from '@angular/core';
import { AdminNotifyMetricsRow } from './admin-notify-metrics.model';
import { Router } from '@angular/router';
import { ViewMode } from '../../../core/shared/view-mode.model';

@Component({
  selector: 'ds-admin-notify-metrics',
  templateUrl: './admin-notify-metrics.component.html',
})
export class AdminNotifyMetricsComponent {

  @Input()
  boxesConfig: AdminNotifyMetricsRow[];

  private incomingConfiguration = 'NOTIFY.incoming';
  private involvedItemsSuffix = 'involvedItems';
  private inboundPath = '/inbound';
  private outboundPath = '/outbound';
  private adminSearchPath = '/admin/search';

  constructor(private router: Router) {
  }


  public navigateToSelectedSearchConfig(searchConfig: string) {
    const isRelatedItemsConfig = searchConfig.endsWith(this.involvedItemsSuffix);

    if (isRelatedItemsConfig) {
      this.router.navigate([this.adminSearchPath], {
        queryParams: {
          configuration: searchConfig,
          view: ViewMode.ListElement
        },
      });

      return;
    }

    const isIncomingConfig = searchConfig.startsWith(this.incomingConfiguration);
    const selectedPath = isIncomingConfig ? this.inboundPath : this.outboundPath;

    this.router.navigate([`${this.router.url}${selectedPath}`], {
      queryParams: {
        configuration: searchConfig,
        view: ViewMode.Table
      },
    });
  }
}