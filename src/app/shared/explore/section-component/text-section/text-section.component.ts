import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TextRowSection } from '../../../../core/layout/models/section.model';
import { LocaleService } from '../../../../core/locale/locale.service';
import { Site } from '../../../../core/shared/site.model';
import { MarkdownViewerComponent } from '../../../markdown-viewer/markdown-viewer.component';


@Component({
  selector: 'ds-base-text-section',
  templateUrl: './text-section.component.html',
  styleUrls: ['./text-section.component.scss'],
  imports: [
    MarkdownViewerComponent,
    NgTemplateOutlet,
    TranslateModule,
    AsyncPipe,
  ],
})
export class TextSectionComponent {

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

  metadataValue(content: string): Observable<string> {
    return this.locale.getCurrentLanguageCode().pipe(
      map(language => this.site?.firstMetadataValue(content, { language }) ?? ''),
    );
  }
}
