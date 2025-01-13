import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import { CountersSectionComponent as BaseComponent} from '../../../../../../../app/shared/explore/section-component/counters-section/counters-section.component';
import {NativeWindowRef, NativeWindowService} from '../../../../../../../app/core/services/window.service';
import {UUIDService} from '../../../../../../../app/core/shared/uuid.service';
import { DOCUMENT, isPlatformServer } from '@angular/common';
import {InternalLinkService} from '../../../../../../../app/core/services/internal-link.service';
import {SearchManager} from '../../../../../../../app/core/browse/search-manager';
import {map, take} from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'ds-counters-section',
  templateUrl: './counters-section.component.html',
  styleUrls: ['./counters-section.component.scss']
})
export class CountersSectionComponent extends BaseComponent implements  OnInit {

  constructor(
    protected internalLinkService: InternalLinkService,
    protected searchManager: SearchManager,
    protected uuidService: UUIDService,
    @Inject(PLATFORM_ID) protected platformId: Object,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    @Inject(DOCUMENT) protected _document: Document
  ) {
    super(internalLinkService, searchManager, _window, uuidService, platformId);
  }

  ngOnInit() {
    super.ngOnInit();

    if (isPlatformServer(this.platformId)) {
      this.counterData$ = of([]);
      return;
    }

    this.counterData$.pipe(
      map(data => data.filter(counter => parseInt(counter.count, 10) > 0).length),
      take(1)
    ).subscribe((numberOfCounters) => {
      if (numberOfCounters <= 3) {
        this._document.documentElement.style.setProperty('--ds-counters-max-columns-per-row', '3');
      } else {
        this._document.documentElement.style.setProperty('--ds-counters-max-columns-per-row', '2');
      }
    });
  }
}
