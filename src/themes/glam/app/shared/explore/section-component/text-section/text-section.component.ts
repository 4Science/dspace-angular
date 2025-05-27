import { Component } from '@angular/core';

import { TextSectionComponent as BaseComponent } from '../../../../../../../app/shared/explore/section-component/text-section/text-section.component';

@Component({
  selector: 'ds-themed-text-section',
  templateUrl: './text-section.component.html',
  styleUrls: ['./text-section.component.scss'],
  standalone: true,
})
export class TextSectionComponent extends BaseComponent {
}
