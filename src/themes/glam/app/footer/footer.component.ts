import {
  AsyncPipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';
import { ThemedTextSectionComponent } from '../../../../app/shared/explore/section-component/text-section/themed-text-section.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ds-themed-footer',
  styleUrls: ['footer.component.scss'],
  templateUrl: 'footer.component.html',
  standalone: true,
  imports: [
    NgIf,
    ThemedTextSectionComponent,
    AsyncPipe,
    TranslateModule,
    NgForOf,
    RouterLink,
  ],
})
export class FooterComponent extends BaseComponent {

  involvedInstitutions = environment.layout.footer.involvedInstitutions;
  socialMedia = environment.layout.footer.socialMedia;
  showGeneralInformation = environment.info.enableGeneralInformation;
  showOfferedServices = environment.info.enableOfferedServices;
  showHistoryDigitalLibrary = environment.info.enableHistoryDigital;
  showOrgStructure = environment.info.enableOrgStructure;

}
