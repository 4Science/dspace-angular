import {
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import {
  COLLECTION_EXPORT_SCRIPT_NAME,
  ScriptDataService,
} from '../../../../core/data/processes/script-data.service';
import { RemoteData } from '../../../../core/data/remote-data';
import { RequestService } from '../../../../core/data/request.service';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { DSpaceObjectType } from '../../../../core/shared/dspace-object-type.model';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';
import { Process } from '../../../../process-page/processes/process.model';
import { ProcessParameter } from '../../../../process-page/processes/process-parameter.model';
import { NotificationsService } from '../../../notifications/notifications.service';
import { AdministeredCollectionSelectorComponent } from '../../dso-selector/administered-collection-selector/administered-collection-selector.component';
import {
  DSOSelectorModalWrapperComponent,
  SelectorActionType,
} from '../dso-selector-modal-wrapper.component';

/**
 * Component to wrap a list of existing collections inside a modal
 * Used to choose a collection from to export collection
 */
@Component({
  selector: 'ds-export-excel-selector',
  templateUrl: './export-excel-selector.component.html',
  standalone: true,
  imports: [
    AdministeredCollectionSelectorComponent,
    TranslateModule,
  ],
})
export class ExportExcelSelectorComponent extends DSOSelectorModalWrapperComponent implements OnInit {
  objectType = DSpaceObjectType.ITEM;
  selectorTypes = [DSpaceObjectType.COLLECTION];
  action = SelectorActionType.EXPORT_ITEM;
  header = 'dso-selector.export-item.sub-level';

  constructor(protected activeModal: NgbActiveModal,
              protected route: ActivatedRoute,
              private router: Router,
              protected translationService: TranslateService,
              private scriptService: ScriptDataService,
              private notificationService: NotificationsService,
              private requestService: RequestService) {
    super(activeModal, route);
  }

  /**
   * Navigate to the export process list after initializing export for collection
   */
  navigate(dso: DSpaceObject) {
    const stringParameters: ProcessParameter[] = [
      { name: '-c', value: dso.id },
    ];

    this.scriptService.invoke(COLLECTION_EXPORT_SCRIPT_NAME, stringParameters, [])
      .pipe(getFirstCompletedRemoteData())
      .subscribe((rd: RemoteData<Process>) => {
        if (rd.isSuccess) {
          this.notificationService.success(this.translationService.get('collection-export.success'));
          this.navigateToProcesses();
        } else {
          this.notificationService.error(this.translationService.get('collection-export.error'));
        }
      });
  }

  /**
   * Redirect to process list page
   */
  private navigateToProcesses() {
    this.requestService.removeByHrefSubstring('/processes');
    this.router.navigateByUrl('/processes');
  }
}
