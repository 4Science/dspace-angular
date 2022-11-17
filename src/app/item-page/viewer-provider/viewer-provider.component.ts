import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Viewer,
  ViewerInitialState,
  ViewerProvider,
  ViewerProviderDsoInterface
} from './viewer-provider-dso.interface';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { ViewerProviderDirective } from './directives/viewer-provider.directive';
import { RouteService } from '../../core/services/route.service';
import { ItemDataService } from '../../core/data/item-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { Item } from '../../core/shared/item.model';
import { Bitstream } from '../../core/shared/bitstream.model';
import { fetchNonNull } from './utils/operators';

@Component({
  selector: 'ds-viewer-provider',
  templateUrl: './viewer-provider.component.html',
  styleUrls: ['./viewer-provider.component.scss']
})
export class ViewerProviderComponent implements OnInit, OnDestroy {

  @ViewChild(ViewerProviderDirective, { static: true }) viewer!: ViewerProviderDirective;

  private readonly routeDSO$: Observable<ViewerProviderDsoInterface> = this.route.data;
  private state$: Observable<ViewerInitialState>;
  private bitstream$: Observable<Bitstream>;
  private item$: Observable<Item>;
  private viewer$: Observable<ViewerProvider>;

  private subscription: Subscription;

  constructor(
    private readonly location: Location,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly routeService: RouteService,
    private readonly items: ItemDataService,
    private readonly authService: AuthService,
  ) {
  }

  ngOnInit(): void {
    this.item$ = this.initItem$();
    this.bitstream$ = this.initBitstream$();
    this.viewer$ = this.initViewer$();
    this.state$ = this.initState$();
    this.subscription =
      this.viewer$.pipe(
        withLatestFrom(this.state$)
      )
        .subscribe(([viewer, state]) => this.initViewerComponent(viewer, state));
  }

  public back(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initViewerComponent(viewer: ViewerProvider, state: ViewerInitialState) {
    const viewContainerRef = this.viewer.viewContainerRef;
    viewContainerRef.clear();
    let viewerComponentRef = viewContainerRef.createComponent<Viewer>(viewer);
    viewerComponentRef.instance.initialize(state);
    viewerComponentRef.changeDetectorRef.detectChanges();
  }

  private initState$() {
    return forkJoin([this.item$, this.bitstream$])
      .pipe(
        map(([item, bitstream]) => ({ item, bitstream } as ViewerInitialState))
      );
  }

  private initViewer$() {
    return this.routeDSO$.pipe(
      map(data => data.viewer),
      filter(Object)
    );
  }

  private initBitstream$() {
    return this.routeDSO$.pipe(
      map(data => data.bitstream),
      fetchNonNull(this.router, this.authService)
    );
  }

  private initItem$() {
    return this.routeDSO$.pipe(
      map((data: ViewerProviderDsoInterface) => data.item),
      fetchNonNull(this.router, this.authService)
    );
  }

}
