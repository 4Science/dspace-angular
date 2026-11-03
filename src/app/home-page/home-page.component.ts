import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { Site } from '../core/shared/site.model';
import { environment } from '../../environments/environment';
import { SectionComponent, TextRowSection } from '../core/layout/models/section.model';
import { SectionDataService } from '../core/layout/section-data.service';
import { getFirstSucceededRemoteDataPayload } from '../core/shared/operators';
import { isEmpty, isNotEmpty } from '../shared/empty.util';
import { SiteDataService } from '../core/data/site-data.service';
import { LocaleService } from '../core/locale/locale.service';

@Component({
  selector: 'ds-home-page',
  styleUrls: ['./home-page.component.scss'],
  templateUrl: './home-page.component.html'
})
export class HomePageComponent implements OnInit, OnDestroy {

  site$: BehaviorSubject<Site> = new BehaviorSubject<Site>(null);
  recentSubmissionspageSize: number;

  sectionId = 'site';

  /**
   * Two-dimensional array (rows and columns) of section components
   */
  sectionComponents: Observable<SectionComponent[][]>;

  hasHomeHeaderMetadata: boolean;

  homeHeaderSection: TextRowSection = {
    content: 'cris.cms.home-header',
    contentType: 'text-metadata',
    componentType: 'text-row',
    style: ''
  };

  subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private sectionDataService: SectionDataService,
    private siteService: SiteDataService,
    private locale: LocaleService,
  ) {
    this.recentSubmissionspageSize = environment.homePage.recentSubmissions.pageSize;
  }

  ngOnInit(): void {
    this.subs.push(this.route.data.pipe(
      map((data) => data.site as Site),
      take(1)
    ).subscribe((site: Site) => {
      this.site$.next(site);
    }));

    this.sectionComponents = this.sectionDataService.findById('site').pipe(
      getFirstSucceededRemoteDataPayload(),
      map((section) => section.componentRows)
    );

    this.subs.push(combineLatest([
      this.locale.getCurrentLanguageCode(),
      this.siteService.find().pipe(take(1))
    ]).subscribe(([language, site]: [string, Site]) => {
        this.hasHomeHeaderMetadata = !isEmpty(site?.firstMetadataValue('cris.cms.home-header', { language }));
      }
    ));
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  componentClass(sectionComponent: SectionComponent) {
    const defaultCol = 'col-12';
    return (isNotEmpty(sectionComponent.style) && sectionComponent.style.includes('col')) ?
      sectionComponent.style : `${defaultCol} ${sectionComponent.style}`;
  }

}
