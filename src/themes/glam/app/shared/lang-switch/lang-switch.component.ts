import {
  NgForOf,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { LangSwitchComponent as BaseComponent } from '../../../../../app/shared/lang-switch/lang-switch.component';

@Component({
  selector: 'ds-themed-lang-switch',
  styleUrls: ['./lang-switch.component.scss'],
  templateUrl: './lang-switch.component.html',
  standalone: true,
  imports: [
    NgbDropdownModule,
    TranslateModule,
    NgForOf,
    NgIf,
  ],
})

/**
 * Component representing a switch for changing the interface language throughout the application
 * If only one language is active, the component will disappear as there are no languages to switch to.
 */
export class LangSwitchComponent extends BaseComponent {}
