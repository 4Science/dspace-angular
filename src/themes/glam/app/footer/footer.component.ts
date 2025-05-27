import { Component } from '@angular/core';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ds-themed-footer',
  styleUrls: ['footer.component.scss'],
  templateUrl: 'footer.component.html',
  standalone: true,
})
export class FooterComponent extends BaseComponent {

  involvedInstitutions = environment.layout.footer.involvedInstitutions;
  socialMedia = environment.layout.footer.socialMedia;
  showGeneralInformation = environment.info.enableGeneralInformation;
  showOfferedServices = environment.info.enableOfferedServices;
  showHistoryDigitalLibrary = environment.info.enableHistoryDigital;
  showOrgStructure = environment.info.enableOrgStructure;

}
