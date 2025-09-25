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
  PACKAGER_SCRIPT_NAME,
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
  isEmpty,
  isNotEmpty,
} from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import {
  SwitchColor,
  SwitchComponent,
  SwitchOption,
} from '../../shared/switch/switch.component';
import { FileDropzoneNoUploaderComponent } from '../../shared/upload/file-dropzone-no-uploader/file-dropzone-no-uploader.component';

@Component({
  selector: 'ds-admin-mag-import',
  templateUrl: './mag-import-page.component.html',
  styleUrls: ['./mag-import-page.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    SwitchComponent,
    NgIf,
    FileDropzoneNoUploaderComponent,
    FormsModule,
  ],
})
export class MagImportPageComponent {
  /**
   * The current value of the file
   */
  fileObject: File;

  /**
   * dso object for community or collection
   */
  dso: DSpaceObject = null;

  /**
   * The flag between upload and url
   */
  isUpload = true;

  /**
   * File URL when flag is for url
   */
  fileURL: string;

  switchOptions: SwitchOption[] = [
    { value: 'upload', icon: 'fa fa-upload', label: 'admin.mag-import.page.toggle.upload', iconColor: SwitchColor.Primary },
    { value: 'url', icon: 'fa fa-link', label: 'admin.mag-import.page.toggle.url', iconColor: SwitchColor.Primary },
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
   * Starts import-metadata script with --zip fileName (and the selected file)
   */
  public import() {
    if (this.fileObject == null && isEmpty(this.fileURL)) {
      if (this.isUpload) {
        this.notificationsService.error(this.translate.get('admin.metadata-import.page.error.addFile'));
      } else {
        this.notificationsService.error(this.translate.get('admin.metadata-import.page.error.addFileUrl'));
      }
    } else {
      const parameterValues = new Array<ProcessParameter>();

      parameterValues.push(Object.assign(new ProcessParameter(), { name: '--type', value: 'MAG' })); // hard coded
      parameterValues.push(Object.assign(new ProcessParameter(), { name: '--parent', value: this.dso.uuid }));

      if (this.isUpload) {
        parameterValues.push(Object.assign(new ProcessParameter(), { name: '--zip', value: this.fileObject.name }));
      } else {
        this.fileObject = null;
        parameterValues.push(Object.assign(new ProcessParameter(), { name: '--url', value: this.fileURL }));
      }

      this.scriptDataService.invoke(PACKAGER_SCRIPT_NAME, parameterValues, [this.fileObject]).pipe(
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

  /**
   * toggle the flag between upload and url
   */
  toggleUpload() {
    this.isUpload = !this.isUpload;
  }
}
