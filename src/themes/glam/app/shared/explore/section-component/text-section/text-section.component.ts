import { Component, Input, OnInit } from '@angular/core';

import { TextRowSection } from '../../../../../../../app/core/layout/models/section.model';
import { Site } from '../../../../../../../app/core/shared/site.model';
import { LocaleService } from '../../../../../../../app/core/locale/locale.service';

@Component({
  selector: 'ds-text-section',
  templateUrl: './text-section.component.html',
  styleUrls: ['./text-section.component.scss'],
})
export class TextSectionComponent implements OnInit {

  content: string;
  @Input()
  sectionId: string;

  @Input()
  textRowSection: TextRowSection;

  @Input()
  site: Site;

  constructor(
    private locale: LocaleService,
  ) {
  }

  ngOnInit() {
    console.log(this.site);
    if (this.site && this.site.metadata && this.textRowSection.content) {
      const mdv = this.site.firstMetadataValue(this.textRowSection.content,
        { language: this.locale.getCurrentLanguageCode() });
      this.content = mdv ?? '';
    }
    console.log(this.textRowSection);
    console.log(this.content);
  }
}
