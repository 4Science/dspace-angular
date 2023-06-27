import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Viewer,
  ViewerInitialState,
  ViewerProvider,
  ViewerProviderDsoInterface
} from './viewer-provider-dso.interface';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { ViewerProviderDirective } from './directives/viewer-provider.directive';
import { AuthService } from '../../core/auth/auth.service';
import { Bitstream } from '../../core/shared/bitstream.model';
import { fetchNonNull } from './utils/operators';
import { BitstreamDataService } from '../../core/data/bitstream-data.service';
import { getFirstCompletedRemoteData } from '../../core/shared/operators';
import { BITSTREAM_VIEWER_LINKS_TO_FOLLOW } from './resolvers/bitstream-viewer.resolver';

@Component({
  selector: 'ds-viewer-provider',
  templateUrl: './viewer-provider.component.html',
  styleUrls: ['./viewer-provider.component.scss']
})
export class ViewerProviderComponent implements OnInit, OnDestroy {

  @ViewChild(ViewerProviderDirective, {static: true}) viewer!: ViewerProviderDirective;

  private routeDSO$: Observable<ViewerProviderDsoInterface> = this.route.data;
  private bitstream$: Observable<Bitstream> = this.initBitstream$();
  private item$ = this.initItem$();

  private viewer$: Observable<ViewerProvider> = this.routeDSO$.pipe(
    map(data => data.viewer),
    filter(Object),
  );

  private subscription: Subscription;
  private isInitalLoad = true;

  showBackButton = !this.location.path().includes('details');

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly location: Location,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly bitstreamDataService: BitstreamDataService,
  ) {}

  ngOnInit(): void {
    this.subscription = combineLatest([this.viewer$, this.item$, this.bitstream$])
      .subscribe(([viewer, item, bitstream]) =>
        this.initViewerComponent(viewer, {item, bitstream})
      );
  }

  public back(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initViewerComponent(viewer: ViewerProvider, state: ViewerInitialState) {
    const vcRef = this.viewer.viewContainerRef;
    vcRef.clear();

    const cmpRef = vcRef.createComponent<Viewer>(viewer);
    cmpRef.instance.initialize(state);
    cmpRef.changeDetectorRef.detectChanges();

    this.scrollToViewer();
  }

  private initItem$() {
    return this.route.data.pipe(
      switchMap((data: ViewerProviderDsoInterface) => {
        if (data.dso) {
          return of(data.dso);
        }

        return this.route.parent.parent.data.pipe(
          map((x: ViewerProviderDsoInterface) => x.dso)
        );
      }),
      fetchNonNull(this.router, this.authService)
    );
  }

  private initBitstream$() {
    const bitstreamId$ = this.route.params.pipe(
      map(params => params.bitstream_id as string),
    );

    const bitstreamFromResolver$ = this.routeDSO$.pipe(
      map(data => data.bitstream),
      fetchNonNull(this.router, this.authService)
    );

    // every time the bitstream id changes, we need to fetch the bitstream
    // on the initial load, we use the bitstream from the resolver
    return bitstreamId$.pipe(
      switchMap((bitstreamId: string) => {
        if (this.isInitalLoad) {
          this.isInitalLoad = false;
          return bitstreamFromResolver$;
        }

        return this.bitstreamDataService.findById(bitstreamId,
          true,
          false,
          ...BITSTREAM_VIEWER_LINKS_TO_FOLLOW
        ).pipe(
          getFirstCompletedRemoteData(),
          fetchNonNull(this.router, this.authService)
        );
      })
    );
  }

  private scrollToViewer() {
    if (!this.showBackButton && this.location.path().includes('viewer')) {
      const element = this.document.getElementById('viewer');
      element?.scrollIntoView({ block: 'end' });
    }
  }
}
