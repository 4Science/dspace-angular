import { Component, Input } from '@angular/core';

import { TextRowSection } from '../../../../core/layout/models/section.model';
import { Site } from '../../../../core/shared/site.model';
import { LocaleService } from '../../../../core/locale/locale.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'ds-text-section',
  templateUrl: './text-section.component.html',
  styleUrls: ['./text-section.component.scss'],
})
export class TextSectionComponent {

  @Input()
  sectionId: string;

  @Input()
  textRowSection: TextRowSection;

  @Input()
  site: Site;

  metadataValue$: Observable<string>;

  constructor(
    private locale: LocaleService,
  ) {
    this.metadataValue$ =  this.locale.getCurrentLanguageCode().pipe(
      map(language => this.site?.firstMetadataValue(this.textRowSection.content, {language}) ?? '')
    );
  }

}
