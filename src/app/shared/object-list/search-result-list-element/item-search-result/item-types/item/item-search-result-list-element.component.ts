import {
  AsyncPipe,
  NgClass,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  differenceInDays,
  differenceInMilliseconds,
  parseISO,
} from 'date-fns';
import {
  combineLatest,
  Observable,
} from 'rxjs';
import {
  filter,
  map,
} from 'rxjs/operators';

import {
  APP_CONFIG,
  AppConfig,
} from '../../../../../../../config/app-config.interface';
import { environment } from '../../../../../../../environments/environment';
import { DSONameService } from '../../../../../../core/breadcrumbs/dso-name.service';
import { Context } from '../../../../../../core/shared/context.model';
import { Item } from '../../../../../../core/shared/item.model';
import { MetadataValueFilter } from '../../../../../../core/shared/metadata.models';
import { PLACEHOLDER_VALUE } from '../../../../../../core/shared/metadata.utils';
import { getFirstSucceededRemoteListPayload } from '../../../../../../core/shared/operators';
import { ViewMode } from '../../../../../../core/shared/view-mode.model';
import {
  getItemPageRoute,
  getItemViewerPath,
} from '../../../../../../item-page/item-page-routing-paths';
import { ThemedThumbnailComponent } from '../../../../../../thumbnail/themed-thumbnail.component';
import { KlaroService } from '../../../../../cookies/klaro.service';
import { isNotEmpty } from '../../../../../empty.util';
import { MetadataLinkViewComponent } from '../../../../../metadata-link-view/metadata-link-view.component';
import { ThemedBadgesComponent } from '../../../../../object-collection/shared/badges/themed-badges.component';
import { InWorkflowStatisticsComponent } from '../../../../../object-collection/shared/in-workflow-statistics/in-workflow-statistics.component';
import { ItemSearchResult } from '../../../../../object-collection/shared/item-search-result.model';
import { listableObjectComponent } from '../../../../../object-collection/shared/listable-object/listable-object.decorator';
import { TruncatableComponent } from '../../../../../truncatable/truncatable.component';
import { TruncatableService } from '../../../../../truncatable/truncatable.service';
import { TruncatablePartComponent } from '../../../../../truncatable/truncatable-part/truncatable-part.component';
import { VarDirective } from '../../../../../utils/var.directive';
import { MetricBadgesComponent } from '../../../../metric-badges/metric-badges.component';
import { MetricDonutsComponent } from '../../../../metric-donuts/metric-donuts.component';
import { AdditionalMetadataComponent } from '../../../additional-metadata/additional-metadata.component';
import { SearchResultListElementComponent } from '../../../search-result-list-element.component';

@listableObjectComponent('PublicationSearchResult', ViewMode.ListElement)
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement)
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement, Context.BrowseMostElements)
@Component({
  selector: 'ds-item-search-result-list-element',
  styleUrls: ['./item-search-result-list-element.component.scss'],
  templateUrl: './item-search-result-list-element.component.html',
  standalone: true,
  imports: [NgIf, RouterLink, ThemedThumbnailComponent, NgClass, ThemedBadgesComponent, TruncatableComponent, TruncatablePartComponent, NgFor, AsyncPipe, TranslateModule, AdditionalMetadataComponent, MetadataLinkViewComponent, MetricBadgesComponent, MetricDonutsComponent, VarDirective, InWorkflowStatisticsComponent, NgbTooltipModule],
})
/**
 * The component for displaying a list element for an item search result of the type Publication
 */
export class ItemSearchResultListElementComponent extends SearchResultListElementComponent<ItemSearchResult, Item> implements OnInit, AfterViewInit {

  /**
   * Whether to show the metrics badges
   */
  @Input() showMetrics = true;

  /**
   * Route to the item's page
   */
  itemPageRoute: string;

  itemViewerRoute: string;

  authorMetadata = environment.searchResult.authorMetadata;

  fullTextMirador: string[];

  fullTextVideo: string[];

  fullTextHighlights: string[];

  hasLoadedThirdPartyMetrics$: Observable<boolean>;

  readonly placeholderFilter: MetadataValueFilter = {
    negate: true,
    value: PLACEHOLDER_VALUE,
  };

  private thirdPartyMetrics = environment.info.metricsConsents.filter(metric => metric.enabled).map(metric => metric.key);

  constructor(
    protected truncatableService: TruncatableService,
    public dsoNameService: DSONameService,
    @Inject(APP_CONFIG) protected appConfig?: AppConfig,
    @Optional() private klaroService?: KlaroService,
  ) {
    super(truncatableService, dsoNameService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.itemPageRoute = getItemPageRoute(this.dso);
    this.itemViewerRoute = getItemViewerPath(this.dso, 'iiif');
    this.fullTextHighlights = this.getHighlights('fulltext');
    this.fullTextMirador = this.getHighlights('fulltext.mirador');
    this.fullTextVideo = this.getHighlights('fulltext.video');
  }

  /**
   * Check if item has Third-party metrics blocked by consents
   */
  ngAfterViewInit() {
    if (this.showMetrics && this.klaroService) {
      this.klaroService.watchConsentUpdates();

      this.hasLoadedThirdPartyMetrics$ = combineLatest([
        this.klaroService.consentsUpdates$.pipe(
          filter(consents => isNotEmpty(consents)),
        ),
        this.dso.metrics?.pipe(
          getFirstSucceededRemoteListPayload(),
          map(metrics => {
            return metrics.filter(metric => this.thirdPartyMetrics.includes(metric.metricType));
          }),
        ),
      ]).pipe(
        map(([consents, metrics]) => {
          return metrics.reduce((previous, current) => {
            return consents[current.metricType] && previous;
          }, true);
        }),
      );
    }
  }

  getDateForItem(itemStartDate: string) {
    const itemStartDateConverted: Date = parseISO(itemStartDate);
    const days: number = Math.floor(differenceInDays(Date.now(), itemStartDateConverted));
    const remainingMilliseconds: number = differenceInMilliseconds(Date.now(), itemStartDateConverted) - days * 24 * 60 * 60 * 1000;
    const hours: number = Math.floor(remainingMilliseconds / (60 * 60 * 1000));
    return `${days} d ${hours} h`;
  }

  /**
   * Prompt user for consents settings
   */
  showSettings() {
    this.klaroService.showSettings();
  }

  /**
   * Get the first part of a delimited metadata value (before '###')
   * This provides better error handling and caching than template splitting
   */
  getDelimitedMetadataValue(metadataKey: string, delimiter: string = '###'): string | null {
    const value = this.firstMetadataValue(metadataKey);
    if (!value) {
      return null;
    }

    const parts = value.split(delimiter);
    return parts.length > 0 ? parts[0].trim() : null;
  }

  /**
   * Get root fond metadata value (first part before ###)
   */
  get rootFondValue(): string | null {
    return this.getDelimitedMetadataValue('cris.virtual.rootFond');
  }

  /**
   * Get root journal fond metadata value (first part before ###)
   */
  get rootJournalFondValue(): string | null {
    return this.getDelimitedMetadataValue('cris.virtual.rootJournalFond');
  }

}
