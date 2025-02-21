import {
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { isNotEmpty } from '@dspace/shared/utils';
import {
  NgbActiveModal,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  Observable,
  of as observableOf,
} from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';

import { DSONameService } from '@dspace/core';
import { AuthorizationDataService } from '@dspace/core';
import { FeatureID } from '@dspace/core';
import {
  BATCH_EXPORT_SCRIPT_NAME,
  ScriptDataService,
} from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { NotificationsService } from '@dspace/core';
import { Process } from '@dspace/core';
import { ProcessParameter } from '@dspace/core';
import { Collection } from '@dspace/core';
import { DSpaceObject } from '@dspace/core';
import { DSpaceObjectType } from '@dspace/core';
import { getFirstCompletedRemoteData } from '@dspace/core';
import { createSuccessfulRemoteDataObject } from '@dspace/core';
import { getProcessDetailRoute } from '../../../../process-page/process-page-routing.paths';
import { ConfirmationModalComponent } from '../../../confirmation-modal/confirmation-modal.component';
import { DSOSelectorComponent } from '../../dso-selector/dso-selector.component';
import {
  DSOSelectorModalWrapperComponent,
  SelectorActionType,
} from '../dso-selector-modal-wrapper.component';

/**
 * Component to wrap a list of existing dso's inside a modal
 * Used to choose a dso from to export metadata of
 */
@Component({
  selector: 'ds-export-batch-selector',
  templateUrl: '../dso-selector-modal-wrapper.component.html',
  standalone: true,
  imports: [ DSOSelectorComponent, TranslateModule],
})
export class ExportBatchSelectorComponent extends DSOSelectorModalWrapperComponent implements OnInit {
  objectType = DSpaceObjectType.DSPACEOBJECT;
  selectorTypes = [DSpaceObjectType.COLLECTION];
  action = SelectorActionType.EXPORT_BATCH;

  constructor(protected activeModal: NgbActiveModal, protected route: ActivatedRoute, private router: Router,
              protected notificationsService: NotificationsService, protected translationService: TranslateService,
              protected scriptDataService: ScriptDataService,
              protected authorizationDataService: AuthorizationDataService,
              protected dsoNameService: DSONameService,
              private modalService: NgbModal) {
    super(activeModal, route);
  }

  /**
   * If the dso is a collection or community: start export-metadata script & navigate to process if successful
   * Otherwise show error message
   */
  navigate(dso: DSpaceObject): Observable<boolean> {
    if (dso instanceof Collection) {
      const modalRef = this.modalService.open(ConfirmationModalComponent);
      modalRef.componentInstance.name = this.dsoNameService.getName(dso);
      modalRef.componentInstance.headerLabel = 'confirmation-modal.export-batch.header';
      modalRef.componentInstance.infoLabel = 'confirmation-modal.export-batch.info';
      modalRef.componentInstance.cancelLabel = 'confirmation-modal.export-batch.cancel';
      modalRef.componentInstance.confirmLabel = 'confirmation-modal.export-batch.confirm';
      modalRef.componentInstance.confirmIcon = 'fas fa-file-export';
      const resp$ =  modalRef.componentInstance.response.pipe(switchMap((confirm: boolean) => {
        if (confirm) {
          const startScriptSucceeded$ = this.startScriptNotifyAndRedirect(dso);
          return startScriptSucceeded$.pipe(
            switchMap((r: boolean) => {
              return observableOf(r);
            }),
          );
        } else {
          const modalRefExport = this.modalService.open(ExportBatchSelectorComponent);
          modalRefExport.componentInstance.dsoRD = createSuccessfulRemoteDataObject(dso);
        }
      }));
      resp$.subscribe();
      return resp$;
    } else {
      return observableOf(false);
    }
  }

  /**
   * Start export-metadata script of dso & navigate to process if successful
   * Otherwise show error message
   * @param dso Dso to export
   */
  private startScriptNotifyAndRedirect(dso: DSpaceObject): Observable<boolean> {
    const parameterValues: ProcessParameter[] = [
      Object.assign(new ProcessParameter(), { name: '--id', value: dso.uuid }),
      Object.assign(new ProcessParameter(), { name: '--type', value: 'COLLECTION' }),
    ];
    return this.authorizationDataService.isAuthorized(FeatureID.AdministratorOf).pipe(
      switchMap(() => {
        return this.scriptDataService.invoke(BATCH_EXPORT_SCRIPT_NAME, parameterValues, []);
      }),
      getFirstCompletedRemoteData(),
      map((rd: RemoteData<Process>) => {
        if (rd.hasSucceeded) {
          const title = this.translationService.get('process.new.notification.success.title');
          const content = this.translationService.get('process.new.notification.success.content');
          this.notificationsService.success(title, content);
          if (isNotEmpty(rd.payload)) {
            this.router.navigateByUrl(getProcessDetailRoute(rd.payload.processId));
          }
          return true;
        } else {
          const title = this.translationService.get('process.new.notification.error.title');
          const content = this.translationService.get('process.new.notification.error.content');
          this.notificationsService.error(title, content);
          return false;
        }
      }),
    );
  }
}
