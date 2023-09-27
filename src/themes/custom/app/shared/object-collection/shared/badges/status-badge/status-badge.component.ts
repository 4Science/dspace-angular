import { Component } from '@angular/core';
import {
  StatusBadgeComponent as BaseComponent
} from 'src/app/shared/object-collection/shared/badges/status-badge/status-badge.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-status-badge',
  // styleUrls: ['./status-badge.component.scss'],
  // templateUrl: './status-badge.component.html',
  templateUrl: '../../../../../../../../app/shared/object-collection/shared/badges/status-badge/status-badge.component.html',
  standalone: true,
  imports: [NgIf, TranslateModule]
})
export class StatusBadgeComponent extends BaseComponent {
}