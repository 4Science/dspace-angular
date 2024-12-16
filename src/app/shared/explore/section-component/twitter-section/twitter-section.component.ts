import { NgForOf } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import { SectionComponent } from '../../../../core/layout/models/section.model';

@Component({
  selector: 'ds-base-twitter-section',
  templateUrl: './twitter-section.component.html',
  styleUrls: ['./twitter-section.component.scss'],
  imports: [
    NgForOf,
  ],
  standalone: true,
})
export class TwitterSectionComponent {

  @Input()
    sectionId: string;

  @Input()
    twitterSection: TwitterSection;

}

export interface TwitterSection extends SectionComponent {
  componentType: 'twitter';
  twitterSettings: TwitterSettings[];
}

export interface TwitterSettings {
  theme: string;
  url: string;
  optOut: boolean;
}
