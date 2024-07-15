import { Component } from '@angular/core';
import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ds-footer',
  styleUrls: ['footer.component.scss'],
  templateUrl: 'footer.component.html'
})
export class FooterComponent extends BaseComponent {

  involvedInstitutions = environment.layout.footer.involvedInstitutions;
  socialMedia = environment.layout.footer.socialMedia;

}
