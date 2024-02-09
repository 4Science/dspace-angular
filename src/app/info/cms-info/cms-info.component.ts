import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SiteDataService } from '../../core/data/site-data.service';
import { LocaleService } from '../../core/locale/locale.service';
import { map, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { hasValue } from '../../shared/empty.util';

@Component({
  selector: 'ds-cms-info',
  templateUrl: './cms-info.component.html',
  styleUrls: ['./cms-info.component.scss'],
})
export class CmsInfoComponent implements OnInit {

  /**
   * The i18n label for the page title
   */
  headLabel$ = new BehaviorSubject<string>('');

  /**
   * The content of the glam.cms.* metadata
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

    const qualifier$ = this.route.data.pipe(
      take(1),
      map((data) => data.qualifier),
    );

    const site$ = this.siteService.find().pipe(take(1));

    combineLatest([qualifier$, site$]).subscribe(([qualifier, site]) => {
      this.headLabel$.next(`info.${qualifier}.head`);
      const mdValue = site?.firstMetadataValue(`glam.cms.${qualifier}`, { language: this.locale.getCurrentLanguageCode() });
      if (hasValue(mdValue)) {
        this.cmsMetadataValue$.next(mdValue);
      } else {
        console.warn(`Metadata glam.cms.${qualifier} has no content`);
      }
      this.metadataLoaded$.next(true);
    });

  }

}
