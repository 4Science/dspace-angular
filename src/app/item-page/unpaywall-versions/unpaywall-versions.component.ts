import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { UnpaywallItemService } from '../../core/data/unpaywall-item.service';
import { UnpaywallItemVersionModel } from '../../core/submission/models/unpaywall-item-version.model';
import { Item } from '../../core/shared/item.model';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ds-unpaywall-versions',
  templateUrl: './unpaywall-versions.component.html',
  styleUrls: ['./unpaywall-versions.component.scss']
})
export class UnpaywallVersionsComponent implements OnInit, OnDestroy {

  private title = 'submission.unpaywall.versions.title';
  itemVersions$: Observable<UnpaywallItemVersionModel[]>;
  onDestroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private location: Location,
              private translate: TranslateService,
              private unpaywallItemService: UnpaywallItemService) {
  }

  ngOnInit(): void {
    this.itemVersions$ = this.getItem().pipe(
      takeUntil(this.onDestroy$),
      switchMap(item => combineLatest([
        this.unpaywallItemService.getItemVersions(item),
        this.isAutoForward(),
      ])),
      tap(([versions, autoForward]) => this.redirectToFirstVersionIfNeeded(autoForward, versions)),
      map(([versions]) => versions)
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  back(): void {
    this.location.back();
  }

  isHostedInRepository(versionRecord: UnpaywallItemVersionModel): boolean {
    return versionRecord.hostType === 'repository';
  }

  get titleText(): Observable<string> {
    return this.getItem().pipe(
      takeUntil(this.onDestroy$),
      map(item => item.firstMetadataValue('dc.title')),
      map(itemTitle => this.translate.instant(this.title).replace('{item.title}', itemTitle))
    );
  }

  private redirectToFirstVersionIfNeeded(autoForward: boolean, versions: UnpaywallItemVersionModel[]): void {
    if (autoForward && versions?.length === 1) {
      window.open(versions[0].pdfUrl || versions[0].landingPageUrl, '_blank');
    }
  }

  private isAutoForward(): Observable<boolean> {
    return this.route.queryParams.pipe(map(params => !!params.autoForward));
  }

  private getItem(): Observable<Item> {
    return this.route.data.pipe(map(data => data.dso.payload));
  }

}
