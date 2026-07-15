import {
  AsyncPipe,
  NgSwitch,
  NgSwitchCase,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { TextRowSection } from '../../../../core/layout/models/section.model';
import { LocaleService } from '../../../../core/locale/locale.service';
import { Site } from '../../../../core/shared/site.model';
import { MarkdownViewerComponent } from '../../../markdown-viewer/markdown-viewer.component';


@Component({
  selector: 'ds-base-text-section',
  templateUrl: './text-section.component.html',
  styleUrls: ['./text-section.component.scss'],
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
    TranslateModule,
    MarkdownViewerComponent,
  ],
})
export class TextSectionComponent {

  @Input()
    sectionId: string;

  @Input()
    textRowSection: TextRowSection;

  @Input()
    site: Site;

  private asyncPipe: AsyncPipe;

  constructor(
    private cdr: ChangeDetectorRef,
    private locale: LocaleService,
  ) {
    this.asyncPipe = new AsyncPipe(cdr);
  }

  metadataValue(content: string) {
    const langCode = this.asyncPipe.transform(this.locale.getCurrentLanguageCode());
    return this.site?.firstMetadataValue(content, { language: langCode }) ?? '';
  }
}
