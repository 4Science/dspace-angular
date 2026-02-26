import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
} from 'rxjs';
import { take } from 'rxjs/operators';

import { SiteDataService } from '../../core/data/site-data.service';
import { LocaleService } from '../../core/locale/locale.service';
import { hasValue } from '../../shared/empty.util';
import { MarkdownViewerComponent } from '../../shared/markdown-viewer/markdown-viewer.component';

@Component({
  selector: 'ds-cms-info',
  templateUrl: './cms-info.component.html',
  styleUrls: ['./cms-info.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    TranslateModule,
    MarkdownViewerComponent,
  ],
})
export class CmsInfoComponent implements OnInit {

  /**
   * The i18n label for the page title
   */
  headLabel$ = new BehaviorSubject<string>('');

  /**
   * The content of the CMS metadata
   */
  cmsMetadataValue$ = new BehaviorSubject<string>('');

  /**
   * True if the metadata content is being loaded
   */
  metadataLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(
    private siteService: SiteDataService,
    private locale: LocaleService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {

    const data$ = this.route.data.pipe(
      take(1),
    );

    const site$ = this.siteService.find().pipe(take(1));

    combineLatest([data$, site$]).subscribe(([data, site]) => {
      this.headLabel$.next(`info.${data.qualifier}.head`);
      const mdValue = site?.firstMetadataValue(`${data.schema}.cms.${data.qualifier}`, { language: this.locale.getCurrentLanguageCode() });
      if (hasValue(mdValue)) {
        this.cmsMetadataValue$.next(mdValue);
      } else {
        console.warn(`Metadata ${data.schema}.cms.${data.qualifier} has no content`);
      }
      this.metadataLoaded$.next(true);
    });

  }

}
