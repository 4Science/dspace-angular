import { AsyncPipe } from '@angular/common';
import {
  Component,
  Injector,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  Observable,
  of as observableOf,
} from 'rxjs';
import { RemoteData } from '@dspace/core';

import { RequestService } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { ClaimedDeclinedTaskTaskSearchResult } from '@dspace/core';
import { DSpaceObject } from '@dspace/core';
import { SearchService } from '@dspace/core';
import { BtnDisabledDirective } from '../../../btn-disabled.directive';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';

export const WORKFLOW_TASK_OPTION_DECLINE_TASK = 'submit_decline_task';

@Component({
  selector: 'ds-claimed-task-actions-decline-task',
  templateUrl: './claimed-task-actions-decline-task.component.html',
  styleUrls: ['./claimed-task-actions-decline-task.component.scss'],
  standalone: true,
  imports: [NgbTooltipModule, AsyncPipe, TranslateModule, BtnDisabledDirective],
})
/**
 * Component for displaying and processing the decline task action on a workflow task item
 */
export class ClaimedTaskActionsDeclineTaskComponent extends ClaimedTaskActionsAbstractComponent {

  constructor(protected injector: Injector,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected searchService: SearchService,
              protected requestService: RequestService) {
    super(injector, router, notificationsService, translate, searchService, requestService);
  }

  reloadObjectExecution(): Observable<RemoteData<DSpaceObject> | DSpaceObject> {
    return observableOf(this.object);
  }

  convertReloadedObject(dso: DSpaceObject): DSpaceObject {
    return Object.assign(new ClaimedDeclinedTaskTaskSearchResult(), dso, {
      indexableObject: dso,
    });
  }

}
