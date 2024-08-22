import {
  Component,
  Input,
} from '@angular/core';

import { BrowseSection } from '../../../../core/layout/models/section.model';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgForOf } from '@angular/common';

/**
 * Component representing the Browse component section.
 */
@Component({
  selector: 'ds-base-browse-section',
  templateUrl: './browse-section.component.html',
  standalone: true,
  imports: [
    RouterLink,
    TranslateModule,
    NgForOf
  ]
})
export class BrowseSectionComponent {

  @Input()
    sectionId: string;

  @Input()
    browseSection: BrowseSection;

}
