import {
  AsyncPipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import isEqual from 'lodash/isEqual';
import {
  BehaviorSubject,
  Observable,
  of as observableOf,
  Subscription,
} from 'rxjs';
import {
  catchError,
  filter,
  first,
  map,
  mergeMap,
  take,
} from 'rxjs/operators';

import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { LinkService } from '../../../core/cache/builders/link.service';
import {
  buildPaginatedList,
  PaginatedList,
} from '../../../core/data/paginated-list.model';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { Bundle } from '../../../core/shared/bundle.model';
import { Item } from '../../../core/shared/item.model';
import {
  getFirstSucceededRemoteDataPayload,
  getFirstSucceededRemoteDataWithNotEmptyPayload,
} from '../../../core/shared/operators';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { AlertType } from '../../../shared/alert/alert-type';
import {
  hasValue,
  isNotEmpty,
} from '../../../shared/empty.util';
import { ResourcePoliciesComponent } from '../../../shared/resource-policies/resource-policies.component';
import { followLink } from '../../../shared/utils/follow-link-config.model';

/**
 * Interface for a bundle's bitstream map entry
 */
interface BundleBitstreamsMapEntry {
  id: string;
  bitstreams: Observable<PaginatedList<Bitstream>>;
}

@Component({
  selector: 'ds-item-authorizations',
  templateUrl: './item-authorizations.component.html',
  styleUrls: ['./item-authorizations.component.scss'],
  imports: [
    ResourcePoliciesComponent,
    NgbCollapseModule,
    TranslateModule,
    NgForOf,
    AsyncPipe,
    NgIf,
    AlertComponent,
  ],
  standalone: true,
})
/**
 * Component that handles the item Authorizations
 */
export class ItemAuthorizationsComponent implements OnInit, OnDestroy {

  /**
   * A map that contains all bitstream of the item's bundles
   * @type {Observable<Map<string, Observable<PaginatedList<Bitstream>>>>}
   */
  public bundleBitstreamsMap: Map<string, BitstreamMapValue> = new Map<string, BitstreamMapValue>();

  /**
   * The list of all bundles for the item
   * @type {Observable<PaginatedList<Bundle>>}
   */
  bundles$: BehaviorSubject<Bundle[]> = new BehaviorSubject<Bundle[]>([]);

  /**
   * The target editing item
   * @type {Observable<Item>}
   */
  item$: Observable<Item>;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  private subs: Subscription[] = [];

  /**
   * The size of the bundles to be loaded on demand
   * @type {number}
   */
  bundlesPerPage = 6;

  /**
   * The number of current page
   * @type {number}
   */
  bundlesPageSize = 1;

  /**
   * The flag to show or not the 'Load more' button
   * based on the condition if all the bundles are loaded or not
   * @type {boolean}
   */
  allBundlesLoaded = false;

  /**
   * Initial size of loaded bitstreams
   * The size of incrementation used in bitstream pagination
   */
  bitstreamSize = 4;

  itemUuid$: Observable<string>;

  /**
   * The size of the loaded bitstremas at a certain moment
   * @private
   */
  private bitstreamPageSize = 4;

  itemName$: Observable<string>;

  readonly AlertType = AlertType;

  constructor(
    protected linkService: LinkService,
    protected route: ActivatedRoute,
    public nameService: DSONameService,
  ) {
  }

  /**
   * Initialize the component, setting up the bundle and bitstream within the item
   */
  ngOnInit(): void {
    this.getBundlesPerItem();
    this.itemName$ = this.getItemName();
    this.itemUuid$ = this.getItemUUID();
  }

  /**
   * Return the item's UUID
   */
  getItemUUID(): Observable<string> {
    return this.item$.pipe(
      map((item: Item) => item.id),
      first((UUID: string) => isNotEmpty(UUID)),
    );
  }

  /**
   * Return the item's name
   */
  private getItemName(): Observable<string> {
    return this.item$.pipe(
      map((item: Item) => this.nameService.getName(item)),
    );
  }

  /**
   * Get all bundles per item
   * and all the bitstreams per bundle
   * @param page number of current page
   */
  getBundlesPerItem(page: number = 1) {
    this.item$ = this.route.data.pipe(
      map((data) => data.dso),
      getFirstSucceededRemoteDataWithNotEmptyPayload(),
      map((item: Item) => this.linkService.resolveLink(
        item,
        followLink('bundles', { findListOptions: { currentPage : page, elementsPerPage: this.bundlesPerPage } }, followLink('bitstreams')),
      )),
    ) as Observable<Item>;

    const bundles$: Observable<PaginatedList<Bundle>> =  this.item$.pipe(
      filter((item: Item) => isNotEmpty(item.bundles)),
      mergeMap((item: Item) => item.bundles),
      getFirstSucceededRemoteDataWithNotEmptyPayload(),
      catchError((error: unknown) => {
        console.error(error);
        return observableOf(buildPaginatedList(null, []));
      }),
    );

    this.subs.push(
      bundles$.pipe(
        take(1),
        map((list: PaginatedList<Bundle>) => list.page),
      ).subscribe((bundles: Bundle[]) => {
        if (isEqual(bundles.length,0) || bundles.length < this.bundlesPerPage) {
          this.allBundlesLoaded = true;
        }
        if (isEqual(page, 1)) {
          this.bundles$.next(bundles);
        } else {
          this.bundles$.next(this.bundles$.getValue().concat(bundles));
        }
      }),
      bundles$.pipe(
        take(1),
        mergeMap((list: PaginatedList<Bundle>) => list.page),
        map((bundle: Bundle) => ({ id: bundle.id, bitstreams: this.getBundleBitstreams(bundle) })),
      ).subscribe((entry: BundleBitstreamsMapEntry) => {
        const bitstreamMapValues: BitstreamMapValue = {
          isCollapsed: true,
          allBitstreamsLoaded: false,
          bitstreams: null,
        };
        bitstreamMapValues.bitstreams = entry.bitstreams.pipe(
          map((b: PaginatedList<Bitstream>) => {
            bitstreamMapValues.allBitstreamsLoaded = b?.page.length < this.bitstreamSize;
            return [...b.page.slice(0, this.bitstreamSize)];
          }),
        );
        this.bundleBitstreamsMap.set(entry.id, bitstreamMapValues);
      }),
    );
  }

  /**
   * Return all bundle's bitstreams
   *
   * @return an observable that emits all item's bundles
   */
  private getBundleBitstreams(bundle: Bundle): Observable<PaginatedList<Bitstream>> {
    return bundle.bitstreams.pipe(
      getFirstSucceededRemoteDataPayload(),
      catchError((error: unknown) => {
        console.error(error);
        return observableOf(buildPaginatedList(null, []));
      }),
    );
  }

  /**
   * Changes the collapsible state of the area that contains the bitstream list
   * @param bundleId Id of bundle responsible for the requested bitstreams
   */
  collapseArea(bundleId: string) {
    this.bundleBitstreamsMap.get(bundleId).isCollapsed = !this.bundleBitstreamsMap.get(bundleId).isCollapsed;
  }

  /**
   * Loads as much bundles as initial value of bundleSize to be displayed
   */
  onBundleLoad(){
    this.bundlesPageSize ++;
    this.getBundlesPerItem(this.bundlesPageSize);
  }

  /**
   * Calculates the bitstreams that are going to be loaded on demand,
   * based on the number configured on this.bitstreamSize.
   * @param bundle parent of bitstreams that are requested to be shown
   * @returns Subscription
   */
  onBitstreamsLoad(bundle: Bundle) {
    return this.getBundleBitstreams(bundle).subscribe((res: PaginatedList<Bitstream>) => {
      const nextBitstreams = res?.page.slice(this.bitstreamPageSize, this.bitstreamPageSize + this.bitstreamSize);
      const bitstreamsToShow = this.bundleBitstreamsMap.get(bundle.id).bitstreams.pipe(
        map((existingBits: Bitstream[])=> {
          return [... existingBits, ...nextBitstreams];
        }),
      );
      this.bitstreamPageSize = this.bitstreamPageSize + this.bitstreamSize;
      const bitstreamMapValues: BitstreamMapValue = {
        bitstreams: bitstreamsToShow ,
        isCollapsed: this.bundleBitstreamsMap.get(bundle.id).isCollapsed,
        allBitstreamsLoaded: res?.page.length <= this.bitstreamPageSize,
      };
      this.bundleBitstreamsMap.set(bundle.id, bitstreamMapValues);
    });
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
  }
}

export interface BitstreamMapValue {
  bitstreams: Observable<Bitstream[]>;
  isCollapsed: boolean;
  allBitstreamsLoaded: boolean;
}
