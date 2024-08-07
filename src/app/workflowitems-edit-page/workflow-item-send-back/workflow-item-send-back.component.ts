import { Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { RequestService } from '../../core/data/request.service';
import { RouteService } from '../../core/services/route.service';
import { WorkflowItemDataService } from '../../core/submission/workflowitem-data.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { WorkflowItemActionPageComponent } from '../workflow-item-action-page.component';

@Component({
  selector: 'ds-workflow-item-send-back',
  templateUrl: '../workflow-item-action-page.component.html',
})
/**
 * Component representing a page to send back a workflow item to the submitter
 */
export class WorkflowItemSendBackComponent extends WorkflowItemActionPageComponent {
  constructor(protected route: ActivatedRoute,
              protected workflowItemService: WorkflowItemDataService,
              protected router: Router,
              protected routeService: RouteService,
              protected notificationsService: NotificationsService,
              protected translationService: TranslateService,
              protected requestService: RequestService,
              protected location: Location,
  ) {
    super(route, workflowItemService, router, routeService, notificationsService, translationService, requestService, location);
  }

  /**
   * Returns the type of page
   */
  getType(): string {
    return 'send-back';
  }

  /**
   * Performs the action of this workflow item action page
   * @param id The id of the WorkflowItem
   */
  sendRequest(id: string): Observable<boolean> {
    return this.workflowItemService.sendBack(id);
  }
}
