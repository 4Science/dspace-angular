import {
  KeyValuePipe,
  NgForOf,
} from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { Operation } from 'fast-json-patch';
import { Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ScriptDataService } from '../../core/data/processes/script-data.service';
import { SiteDataService } from '../../core/data/site-data.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { Site } from '../../core/shared/site.model';
import { AlertComponent } from '../../shared/alert/alert.component';
import { NotificationsService } from '../../shared/notifications/notifications.service';

/**
 * Component that represents the user agreement edit page for administrators.
 */
@Component({
  selector: 'ds-admin-edit-user-agreement',
  templateUrl: './admin-edit-user-agreement.component.html',
  imports: [
    AlertComponent,
    TranslateModule,
    KeyValuePipe,
    FormsModule,
    NgForOf,
  ],
  standalone: true,
})
export class AdminEditUserAgreementComponent implements OnInit, OnDestroy {

  userAgreementTexts: Map<string,UserAgreementText> = new Map();
  site: Site;

  subs: Subscription[] = [];

  USER_AGREEMENT_TEXT_METADATA = 'dc.rights';

  USER_AGREEMENT_METADATA = 'dspace.agreements.end-user';

  constructor(private siteService: SiteDataService,
              private modalService: NgbModal,
              private translateService: TranslateService,
              private notificationsService: NotificationsService,
              private scriptDataService: ScriptDataService ) {

  }

  ngOnInit(): void {

    environment.languages.filter((language) => language.active)
      .forEach((language) => {
        this.userAgreementTexts.set( language.code, {
          languageLabel: language.label,
          text: '',
        });
      });

    this.subs.push(this.siteService.find().subscribe((site) => {
      this.site = site;
      for (const metadata of site.metadataAsList) {
        if (metadata.key === this.USER_AGREEMENT_TEXT_METADATA) {
          const userAgreementText = this.userAgreementTexts.get(metadata.language);
          if (userAgreementText != null) {
            userAgreementText.text = metadata.value;
          }
        }
      }
    }));
  }

  /**
   * Show the confirm modal to choose if  all users must be forced to accept the new user agreement or not.
   * @param content the modal content
   */
  confirmEdit(content: any) {
    this.modalService.open(content).result.then( (result) => {
      if (result === 'cancel') {
        return;
      }
      const operations = this.getOperationsToEditText();
      this.subs.push(this.siteService.patch(this.site, operations).pipe(
        getFirstCompletedRemoteData(),
      ).subscribe((restResponse) => {
        if (restResponse.hasSucceeded) {
          this.notificationsService.success(this.translateService.get('admin.edit-user-agreement.success'));
          if ( result === 'edit-with-reset' ) {
            this.deleteAllUserAgreementMetadataValues();
          }
        } else {
          this.notificationsService.error(this.translateService.get('admin.edit-user-agreement.error'));
        }
      }));
    });
  }

  /**
   * Returns the operations to update the user agreement text metadata.
   */
  private getOperationsToEditText(): Operation[] {
    const firstLanguage = this.userAgreementTexts.keys().next().value;
    const operations = [];
    operations.push({
      op: 'replace',
      path: '/metadata/' + this.USER_AGREEMENT_TEXT_METADATA,
      value: {
        value: this.userAgreementTexts.get(firstLanguage).text,
        language: firstLanguage,
      },
    });
    this.userAgreementTexts.forEach((value, key) => {
      if (key !== firstLanguage) {
        operations.push({
          op: 'add',
          path: '/metadata/' + this.USER_AGREEMENT_TEXT_METADATA,
          value: {
            value: value.text,
            language: key,
          },
        });
      }
    });
    return operations;
  }

  /**
   * Invoke the script to delete all the the user agreement text metadata values.
   */
  private deleteAllUserAgreementMetadataValues() {
    this.subs.push(this.scriptDataService.invoke('metadata-deletion', [{ name: '-metadata', value: this.USER_AGREEMENT_METADATA }], []).subscribe());
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

}

interface UserAgreementText {
  languageLabel: string;
  text: string;
}
