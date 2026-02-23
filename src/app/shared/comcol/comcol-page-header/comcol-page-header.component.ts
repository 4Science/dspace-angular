import { NgIf } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import { EscapeHtmlPipe } from '../../utils/escape-html.pipe';

@Component({
  selector: 'ds-comcol-page-header',
  styleUrls: ['./comcol-page-header.component.scss'],
  templateUrl: './comcol-page-header.component.html',
  imports: [
    NgIf,
    EscapeHtmlPipe,
  ],
  standalone: true,
})
export class ComcolPageHeaderComponent {
  @Input() name: string;
}
