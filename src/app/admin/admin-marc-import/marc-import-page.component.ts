import {
  Location,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import {
  MARC_XML_SCRIPT_NAME,
  ScriptDataService,
} from '../../core/data/processes/script-data.service';
import { RemoteData } from '../../core/data/remote-data';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { getProcessDetailRoute } from '../../process-page/process-page-routing.paths';
import { Process } from '../../process-page/processes/process.model';
import { ProcessParameter } from '../../process-page/processes/process-parameter.model';
import { ImportBatchSelectorComponent } from '../../shared/dso-selector/modal-wrappers/import-batch-selector/import-batch-selector.component';
import {
  isNotEmpty,
} from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import {
  SwitchColor,
  SwitchOption,
} from '../../shared/switch/switch.component';
import { FileDropzoneNoUploaderComponent } from '../../shared/upload/file-dropzone-no-uploader/file-dropzone-no-uploader.component';

@Component({
  selector: 'ds-admin-marc-import',
  templateUrl: './marc-import-page.component.html',
  styleUrls: ['./marc-import-page.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    NgIf,
    FileDropzoneNoUploaderComponent,
    FormsModule,
  ],
})
export class MarcImportPageComponent {

  /**
   * The current value of the file
   */
  fileObject: File;

  /**
   * dso object
   */
  dso: DSpaceObject = null;

  switchOptions: SwitchOption[] = [
    { value: 'upload', icon: 'fa fa-upload', label: 'admin.marc-import.page.toggle.upload', iconColor: SwitchColor.Primary },
  ];

  public constructor(private location: Location,
                     protected translate: TranslateService,
                     protected notificationsService: NotificationsService,
                     private scriptDataService: ScriptDataService,
                     private router: Router,
                     private modalService: NgbModal,
                     private dsoNameService: DSONameService) {
  }

  /**
   * Set file
   * @param file
   */
  setFile(file) {
    this.fileObject = file;
  }

  /**
   * When return button is pressed go to previous location
   */
  public onReturn() {
    this.location.back();
  }

  public selectCollection() {
    const modalRef = this.modalService.open(ImportBatchSelectorComponent);
    modalRef.componentInstance.response.pipe(take(1)).subscribe((dso) => {
      this.dso = dso || null;
    });
  }

  /**
   * Starts import
   */
  public import() {
    if (this.fileObject == null) {
        this.notificationsService.error(this.translate.get('admin.metadata-import.page.error.addFile'));
    } else {
      const parameterValues = new Array<ProcessParameter>();
      parameterValues.push(Object.assign(new ProcessParameter(), { name: '--collection-uuid', value: this.dso.uuid }));
      parameterValues.push(Object.assign(new ProcessParameter(), { name: '--file', value: this.fileObject.name }));

      this.scriptDataService.invoke(MARC_XML_SCRIPT_NAME, parameterValues, [this.fileObject]).pipe(
        getFirstCompletedRemoteData(),
      ).subscribe((rd: RemoteData<Process>) => {
        if (rd.hasSucceeded) {
          const title = this.translate.get('process.new.notification.success.title');
          const content = this.translate.get('process.new.notification.success.content');
          this.notificationsService.success(title, content);
          if (isNotEmpty(rd.payload)) {
            this.router.navigateByUrl(getProcessDetailRoute(rd.payload.processId));
          }
        } else {
          const title = this.translate.get('process.new.notification.error.title');
          const content = this.translate.get('process.new.notification.error.content');
          this.notificationsService.error(title, content);
        }
      });
    }
  }

  /**
   * return selected dspace object name
  */
  getDspaceObjectName(): string {
    if (this.dso) {
      return this.dsoNameService.getName(this.dso);
    }
    return null;
  }

  /**
   * remove selected dso object
   */
  removeDspaceObject(): void {
    this.dso = null;
  }

}
