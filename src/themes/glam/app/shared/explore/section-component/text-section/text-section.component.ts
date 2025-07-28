import {
  NgClass,
  NgIf,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TextSectionComponent as BaseComponent } from '../../../../../../../app/shared/explore/section-component/text-section/text-section.component';
import { MarkdownViewerComponent } from '../../../../../../../app/shared/markdown-viewer/markdown-viewer.component';

@Component({
  selector: 'ds-themed-text-section',
  templateUrl: './text-section.component.html',
  styleUrls: ['./text-section.component.scss'],
  standalone: true,
  imports: [
    MarkdownViewerComponent,
    NgClass,
    NgIf,
    TranslateModule,
  ],
})
export class TextSectionComponent extends BaseComponent {
}
