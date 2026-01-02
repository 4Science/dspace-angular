import { NgForOf } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { BrowseSection } from '../../../../core/layout/models/section.model';

/**
 * Component representing the Browse component section.
 */
@Component({
  selector: 'ds-base-browse-section',
  templateUrl: './browse-section.component.html',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    TranslateModule,
  ],
})
export class BrowseSectionComponent {

  @Input()
    sectionId: string;

  @Input()
    browseSection: BrowseSection;

}
