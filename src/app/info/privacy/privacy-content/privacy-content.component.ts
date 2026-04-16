import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  Subscription,
} from 'rxjs';

import { SiteDataService } from '../../../core/data/site-data.service';
import { LocaleService } from '../../../core/locale/locale.service';
import { MetadatumViewModel } from '../../../core/shared/metadata.models';
import { isNotEmpty } from '../../../shared/empty.util';
import { MarkdownViewerComponent } from '../../../shared/markdown-viewer/markdown-viewer.component';

@Component({
  selector: 'ds-privacy-content',
  templateUrl: './privacy-content.component.html',
  styleUrls: ['./privacy-content.component.scss'],
  standalone: true,
  imports: [RouterLink, TranslateModule, AsyncPipe, MarkdownViewerComponent, NgIf],
})
/**
 * Component displaying the contents of the Privacy Statement
 */
export class PrivacyContentComponent implements OnInit, OnDestroy {

  PRIVACY_POLICY_TEXT_METADATA = 'cris.cms.privacy-policy';

  subs: Subscription[] = [];

  privacyPolicyText$: BehaviorSubject<string | null> = new BehaviorSubject(null);

  constructor(
    private siteService: SiteDataService,
    private localeService: LocaleService,
    private translateService: TranslateService,
  ) {
  }

  private filterMetadata(metadata: MetadatumViewModel, langCode: string) {
    return metadata.key === this.PRIVACY_POLICY_TEXT_METADATA && metadata.language === langCode && isNotEmpty(metadata.value);
  }

  ngOnInit(): void {
    this.subs.push(
      this.siteService.find().subscribe((site) => {
        const langCode = this.localeService.getCurrentLanguageCode();
        const fallbackLangCode = 'en';

        const textArray = site?.metadataAsList.filter((metadata) =>
          this.filterMetadata(metadata, langCode),
        );
        const fallbackTextArray = site?.metadataAsList.filter((metadata) =>
          this.filterMetadata(metadata, fallbackLangCode),
        );

        const value = textArray[0]?.value || fallbackTextArray[0]?.value || '';
        this.privacyPolicyText$.next(value);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

}
