import {
  AsyncPipe,
  isPlatformBrowser,
  NgForOf,
  NgIf,
  SlicePipe,
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  Router,
  RouterLink,
} from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  BehaviorSubject,
  from,
} from 'rxjs';
import {
  filter,
  map,
  mergeMap,
  scan,
  switchMap,
  take,
} from 'rxjs/operators';
import { getItemPageRoute } from 'src/app/item-page/item-page-routing-paths';
import { BackgroundImageDirective } from 'src/app/shared/utils/background-image.directive';

import {
  SortDirection,
  SortOptions,
} from '../../../../core/cache/models/sort-options.model';
import { BitstreamDataService } from '../../../../core/data/bitstream-data.service';
import { PaginatedList } from '../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../core/data/remote-data';
import {
  GridSection,
  LayoutModeEnum,
} from '../../../../core/layout/models/section.model';
import { LocaleService } from '../../../../core/locale/locale.service';
import { Bitstream } from '../../../../core/shared/bitstream.model';
import { BitstreamFormat } from '../../../../core/shared/bitstream-format.model';
import { Context } from '../../../../core/shared/context.model';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { Item } from '../../../../core/shared/item.model';
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteData,
} from '../../../../core/shared/operators';
import { SearchService } from '../../../../core/shared/search/search.service';
import { Site } from '../../../../core/shared/site.model';
import { hasValue } from '../../../../shared/empty.util';
import { SearchResult } from '../../../../shared/search/models/search-result.model';
import { followLink } from '../../../../shared/utils/follow-link-config.model';
import { ThemedThumbnailComponent } from '../../../../thumbnail/themed-thumbnail.component';
import { PaginationComponentOptions } from '../../../pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../../search/models/paginated-search-options.model';

/**
 * Component representing the Grid component section.
 */
@Component({
  selector: 'ds-base-grid-section',
  templateUrl: './grid-section.component.html',
  styleUrls: ['./grid-section.component.scss'],
  imports: [
    ThemedThumbnailComponent,
    NgForOf,
    SlicePipe,
    AsyncPipe,
    TranslateModule,
    BackgroundImageDirective,
    RouterLink,
    NgxSkeletonLoaderModule,
    NgIf,
  ],
  standalone: true,
})
export class GridSectionComponent implements OnInit {

  @Input()
    sectionId: string;

  @Input()
    gridSection: GridSection;

  @Input()
    context: Context = Context.BrowseMostElements;

  @Input()
    site: Site;

  paginatedSearchOptions: PaginatedSearchOptions;

  layoutMode: LayoutModeEnum = LayoutModeEnum.CARD;

  maincontentBadge: string;

  maincontentTitle: string;

  maincontentSubtitle: string;

  maincontentAbstract: string;

  maincontentLink: string;

  searchResults: SearchResult<DSpaceObject>[];

  itemToImageHrefMap$ = new BehaviorSubject<Map<string, string>>(new Map<string, string>());

  isBrowser: boolean;

  isLoading = true;

  constructor(
    private searchService: SearchService,
    private locale: LocaleService,
    private router: Router,
    private translateService: TranslateService,
    private bitstreamDataService: BitstreamDataService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {
  }

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);

    const pagination = Object.assign(new PaginationComponentOptions(), {
      id: 'search-object-pagination',
      pageSize: 8,
      currentPage: 1,
    });
    this.paginatedSearchOptions = new PaginatedSearchOptions({
      configuration: this.gridSection.discoveryConfigurationName,
      pagination: pagination,
      sort: new SortOptions(this.gridSection.sortField ?? 'dc.date.accessioned', this.gridSection.order ?? SortDirection.DESC),
      projection: 'preventMetadataSecurity',
    });

    this.getMainBoxResults();

    this.getSearchResults();
  }

  private getMainBoxResults() {
    if (this.site && this.site.metadata) {
      this.maincontentBadge = this.site.firstMetadataValue('cris.cms.grid-component-badge',
        { language: this.locale.getCurrentLanguageCode() });

      this.maincontentTitle = this.site.firstMetadataValue('cris.cms.grid-component-title',
        { language: this.locale.getCurrentLanguageCode() });

      this.maincontentSubtitle = this.site.firstMetadataValue('cris.cms.grid-component-subtitle',
        { language: this.locale.getCurrentLanguageCode() });

      this.maincontentAbstract = this.site.firstMetadataValue('cris.cms.grid-component-abstract',
        { language: this.locale.getCurrentLanguageCode() });

      this.maincontentLink = this.site.firstMetadataValue('cris.cms.grid-component-link',
        { language: this.locale.getCurrentLanguageCode() });

    }
    this.maincontentBadge = this.maincontentBadge ?? this.translateService.instant('grid.component.badge');
    this.maincontentTitle = this.maincontentTitle ?? this.translateService.instant('grid.component.title');
    this.maincontentSubtitle = this.maincontentSubtitle ?? this.translateService.instant('grid.component.subtitle');
    this.maincontentAbstract = this.maincontentAbstract ?? this.translateService.instant('grid.component.abstract');
    this.maincontentLink = this.maincontentLink ?? this.translateService.instant('grid.component.link');
  }

  private getSearchResults() {
    this.searchService
      .search(this.paginatedSearchOptions, null, true, true, followLink('thumbnail'))
      .pipe(getFirstSucceededRemoteData())
      .subscribe(
        (response: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
          this.searchResults = response.payload.page;
          this.getAllBitstreams();
        },
      );
  }

  private getAllBitstreams() {
    this.isLoading = true;
    from(this.searchResults).pipe(
      map((itemSR: any) => itemSR.indexableObject),
      mergeMap((item: Item) => this.bitstreamDataService.showableByItem(
        item.uuid, 'ORIGINAL', [], {}, true, true, followLink('format'),
      ).pipe(
        getFirstCompletedRemoteData(),
        switchMap((rd: RemoteData<PaginatedList<Bitstream>>) => rd.hasSucceeded ? rd.payload.page : []),
        mergeMap((bitstream: Bitstream) => bitstream.format.pipe(
          getFirstCompletedRemoteData(),
          filter((formatRemoteData: RemoteData<BitstreamFormat>) =>
            formatRemoteData.hasSucceeded && hasValue(formatRemoteData.payload) && hasValue(bitstream) &&
              formatRemoteData.payload.mimetype.includes('image/'),
          ),
          map(() => bitstream),
        )),
        take(1),
        map((bitstream: Bitstream) => {
          return [item.uuid, bitstream._links.content.href];
        }),
      ),
      ),
      scan((acc: Map<string, string>, value: [string, string]) => {
        acc.set(value[0], value[1]);
        return acc;
      }, new Map<string, string>()),
    ).subscribe((res) => {
      this.itemToImageHrefMap$.next(res);
      this.isLoading = false;
      this.cdr.detectChanges();
    });

  }


  /**
   * to get the route of the item
   * @param item
   * @returns route to the item as a string
   */
  getItemPageRoute(item: DSpaceObject) {
    return getItemPageRoute(item as Item);
  }

  goToMainContentLink() {
    this.router.navigateByUrl(this.maincontentLink);
  }
}
