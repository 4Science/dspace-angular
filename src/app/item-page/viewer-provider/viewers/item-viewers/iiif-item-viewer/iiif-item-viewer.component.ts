import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap,
} from '@angular/router';
import {
  Observable,
  OperatorFunction,
} from 'rxjs';
import {
  filter,
  map,
  switchMap,
} from 'rxjs/operators';

import { RouteService } from '../../../../../core/services/route.service';
import { MiradorViewerComponent } from '../../../../mirador-viewer/mirador-viewer.component';
import { isIiifSearchEnabled } from '../../../shared/viewer-provider.utils';
import { BaseItemViewerComponent } from '../base-item-viewer.component';

@Component({
  selector: 'ds-iiif-item-viewer',
  templateUrl: './iiif-item-viewer.component.html',
  styleUrls: ['./iiif-item-viewer.component.scss'],
  imports: [
    MiradorViewerComponent,
    AsyncPipe,
  ],
  standalone: true,
})
export class IIIFItemViewerComponent extends BaseItemViewerComponent implements OnInit {

  private readonly CANVAS_PARAM: string = 'canvasId';
  private readonly QUERY_PARAM: string = 'query';

  isSearchable$: Observable<boolean>;
  query$: Observable<string>;
  canvasId$: Observable<string>;

  constructor(
    private readonly routeService: RouteService,
    private route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    const queryParams$ = this.route.queryParamMap.pipe(
      filter(queryMap => queryMap != null),
    );
    this.canvasId$ = queryParams$.pipe(
      this.extractParam(queryMap => queryMap.get(this.CANVAS_PARAM)),
    );
    this.isSearchable$ = this.item$.pipe(
      map((item) => isIiifSearchEnabled(item)),
    );
    this.query$ = this.isSearchable$.pipe(
      filter((isSearchable) => !!isSearchable),
      switchMap(() => queryParams$.pipe(this.extractParam(queryMap => queryMap.get(this.QUERY_PARAM)))),
    );
  }

  private extractParam<T>(mapper: (queryMap: ParamMap) => T): OperatorFunction<ParamMap, T> {
    return map(mapper);
  }
}
