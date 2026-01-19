import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';
import { ThemedTextSectionComponent } from '../../../../app/shared/explore/section-component/text-section/themed-text-section.component';

@Component({
  selector: 'ds-themed-footer',
  // styleUrls: ['./footer.component.scss'],
  styleUrls: ['../../../../app/footer/footer.component.scss'],
  // templateUrl: './footer.component.html'
  templateUrl: '../../../../app/footer/footer.component.html',
  imports: [
    AsyncPipe,
    RouterLink,
    ThemedTextSectionComponent,
    TranslateModule,
  ],
})
export class FooterComponent extends BaseComponent {
}
