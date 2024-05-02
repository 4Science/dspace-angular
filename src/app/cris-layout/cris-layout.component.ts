import { PaginatedList } from './../core/data/paginated-list.model';
import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../core/shared/item.model';
import { TabDataService } from '../core/layout/tab-data.service';
import { CrisLayoutTab } from '../core/layout/models/tab.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { getFirstSucceededRemoteData, getPaginatedListPayload, getRemoteDataPayload } from '../core/shared/operators';
import { isNotEmpty } from '../shared/empty.util';
import {ActivatedRoute, Router} from '@angular/router';
import { RemoteData } from '../core/data/remote-data';
import {RouteService} from '../core/services/route.service';

/**
 * Component for determining what component to use depending on the item's entity type (dspace.entity.type)
 */
@Component({
  selector: 'ds-cris-layout',
  templateUrl: './cris-layout.component.html',
  styleUrls: ['./cris-layout.component.scss']
})
export class CrisLayoutComponent implements OnInit {

  /**
   * This regex matches previous routes. The button is shown
   * for matching paths and hidden in other cases.
   */
  previousRoute = /^(\/search|\/browse|\/collections|\/admin\/search|\/mydspace)/;

  /**
   * DSpace Item to render
   */
  @Input() item: Item;

  /**
   * DSpace dataTabs coming as Input for specific item
   */
  @Input() dataTabs$: Observable<RemoteData<PaginatedList<CrisLayoutTab>>>;

  /**
   * A boolean representing if to show context menu or not
   */
  @Input() showContextMenu = true;

  /**
   * Get tabs for the specific item
   */
  tabs$: Observable<CrisLayoutTab[]>;

  /**
   * Get loader tabs for the specific item
   */
  loaderTabs$: Observable<CrisLayoutTab[]>;

  /**
   * Get leading for the specific item
   */
  leadingTabs$: Observable<CrisLayoutTab[]>;

  /**
   * Get if has leading tabs
   */
  hasLeadingTab$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Used to show or hide the back to results button in the view.
   */
  showBackButton: Observable<boolean>;

  constructor(private tabService: TabDataService,
              private router: ActivatedRoute,
              protected routeService: RouteService,
              protected route: Router) {
  }

  /**
   * Get tabs for the specific item
   */
  ngOnInit(): void {

    this.showBackButton = this.routeService.getPreviousUrl().pipe(
      filter(url => this.previousRoute.test(url)),
      take(1),
      map(() => true)
    );

    if (!!this.dataTabs$) {
      this.tabs$ = this.dataTabs$.pipe(
        map((res: any) => {
          return res.payload.page;
        })
      );
    } else {
      this.tabs$ = this.router.data.pipe(
        map((res: any) => {
          return res.tabs.payload.page;
        })
      );
    }
    this.leadingTabs$ = this.getLeadingTabs();
    this.loaderTabs$ = this.getLoaderTabs();

    this.hasLeadingTab().pipe(
      filter((result) => isNotEmpty(result)),
      take(1),
    ).subscribe((result) => {
      this.hasLeadingTab$.next(result);
    });
  }

  /**
   * Get tabs for the specific item
   */
  getTabsByItem(): Observable<CrisLayoutTab[]> {
    // Since there is no API ready
    return this.tabService.findByItem(this.item.uuid, true).pipe(
      getFirstSucceededRemoteData(),
      getRemoteDataPayload(),
      getPaginatedListPayload()
    );
  }

  /**
   * Get tabs for the leading component where parameter leading is true b
   */
  getLeadingTabs(): Observable<CrisLayoutTab[]> {
    return this.tabs$.pipe(
      map((tabs: CrisLayoutTab[]) => tabs.filter(tab => tab.leading)),
    );
  }

  /**
   * Get tabs for the loader component where parameter leading is false
   */
  getLoaderTabs(): Observable<CrisLayoutTab[]> {
    return this.tabs$.pipe(
      map((tabs: CrisLayoutTab[]) => tabs.filter(tab => !tab.leading)),
    );
  }

  /**
   * Return a boolean representing if there is a leading tab configured
   */
  hasLeadingTab(): Observable<boolean> {
    return this.getLeadingTabs().pipe(
      map((tabs: CrisLayoutTab[]) => tabs && tabs.length > 0)
    );
  }

  /**
   * The function used to return to list from the item.
   */
  back = () => {
    this.routeService.getPreviousUrl().pipe(
      take(1)
    ).subscribe(
      (url => {
        this.route.navigateByUrl(url);
      })
    );
  };

}
