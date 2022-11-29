import { Component, OnInit } from '@angular/core';
import { BaseItemViewerComponent } from '../base-item-viewer.component';
import { RouteService } from '../../../../../core/services/route.service';
import { filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { getDSpaceQuery, isIiifSearchEnabled } from '../../../shared/viewer-provider.utils';

@Component({
  selector: 'ds-iiif-item-viewer',
  templateUrl: './iiif-item-viewer.component.html',
  styleUrls: ['./iiif-item-viewer.component.scss']
})
export class IIIFItemViewerComponent extends BaseItemViewerComponent implements OnInit {

  isSearchable$: Observable<boolean>;
  query$: Observable<string>;

  constructor(
    private readonly routeService: RouteService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isSearchable$ = this.item$.pipe(
      map((item) => isIiifSearchEnabled(item))
    );
    this.query$ = this.item$.pipe(
      withLatestFrom(this.isSearchable$),
      filter(([, isSearchable]) => !!isSearchable),
      switchMap(([item]) => getDSpaceQuery(item, this.routeService))
    );
  }

}
