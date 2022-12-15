import { Component, OnInit } from '@angular/core';
import { BaseItemViewerComponent } from '../base-item-viewer.component';
import { RouteService } from '../../../../../core/services/route.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { Observable, OperatorFunction } from 'rxjs';
import { isIiifSearchEnabled } from '../../../shared/viewer-provider.utils';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'ds-iiif-item-viewer',
  templateUrl: './iiif-item-viewer.component.html',
  styleUrls: ['./iiif-item-viewer.component.scss']
})
export class IIIFItemViewerComponent extends BaseItemViewerComponent implements OnInit {

  private readonly CANVAS_PARAM: string = 'canvasId';
  private readonly QUERY_PARAM: string = 'query';

  isSearchable$: Observable<boolean>;
  query$: Observable<string>;
  canvasId$: Observable<number>;

  constructor(
    private readonly routeService: RouteService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    const queryParams$ = this.route.queryParamMap.pipe(
      filter(queryMap => queryMap != null),
    );
    this.canvasId$ = queryParams$.pipe(
      this.extractParam(queryMap => +queryMap.get(this.CANVAS_PARAM))
    );
    this.isSearchable$ = this.item$.pipe(
      map((item) => isIiifSearchEnabled(item))
    );
    this.query$ = this.isSearchable$.pipe(
      filter((isSearchable) => !!isSearchable),
      switchMap(() => queryParams$.pipe(this.extractParam(queryMap => queryMap.get(this.QUERY_PARAM))))
    );
  }

  private extractParam<T>(mapper: (queryMap: ParamMap) => T): OperatorFunction<ParamMap, T> {
    return map(mapper);
  }
}
