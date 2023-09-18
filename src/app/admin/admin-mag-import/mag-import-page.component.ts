import { Component } from '@angular/core';
import {
  PACKAGER_SCRIPT_NAME,
  ScriptDataService,
} from '../../core/data/processes/script-data.service';
import { ProcessParameter } from '../../process-page/processes/process-parameter.model';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { RemoteData } from '../../core/data/remote-data';
import { Process } from '../../process-page/processes/process.model';
import { isNotEmpty } from '../../shared/empty.util';
import { getProcessDetailRoute } from '../../process-page/process-page-routing.paths';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ds-admin-mag-import',
  templateUrl: './mag-import-page.component.html',
  styleUrls: ['./mag-import-page.component.scss']
})
export class MagImportPageComponent {

  typeParam: string;
  objectParam: string;
  fileObject: File;

  optionList = [ 'MAG', 'METS' ];

  constructor(
    protected scriptDataService: ScriptDataService,
    protected translate: TranslateService,
    protected notificationsService: NotificationsService,
    private router: Router,
  ) { }

  setFile(file) {
    this.fileObject = file;
  }

  onSubmit() {
    const parameterValues = new Array<ProcessParameter>();

    parameterValues.push(Object.assign(new ProcessParameter(), { name: '--type', value: this.typeParam }));
    parameterValues.push(Object.assign(new ProcessParameter(), { name: '--parent', value: this.objectParam }));
    parameterValues.push(Object.assign(new ProcessParameter(), { name: '--file-path', value: this.fileObject.name }));

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
