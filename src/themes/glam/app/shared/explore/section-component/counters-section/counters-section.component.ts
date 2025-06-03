import {
  AsyncPipe,
  DOCUMENT,
  isPlatformServer,
  NgForOf,
  NgIf,
  NgStyle,
} from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import {
  map,
  take,
} from 'rxjs/operators';

import { SearchManager } from '../../../../../../../app/core/browse/search-manager';
import { InternalLinkService } from '../../../../../../../app/core/services/internal-link.service';
import {
  NativeWindowRef,
  NativeWindowService,
} from '../../../../../../../app/core/services/window.service';
import { CountersSectionComponent as BaseComponent } from '../../../../../../../app/shared/explore/section-component/counters-section/counters-section.component';
import { ThemedLoadingComponent } from '../../../../../../../app/shared/loading/themed-loading.component';

@Component({
  selector: 'ds-themed-counters-section',
  templateUrl: './counters-section.component.html',
  styleUrls: ['./counters-section.component.scss'],
  standalone: true,
  imports: [
    NgStyle,
    AsyncPipe,
    ThemedLoadingComponent,
    TranslateModule,
    NgIf,
    NgForOf,
  ],
})
export class CountersSectionComponent extends BaseComponent implements  OnInit {

  constructor(
    protected internalLinkService: InternalLinkService,
    protected searchManager: SearchManager,
    @Inject(PLATFORM_ID) protected platformId: any,
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    @Inject(DOCUMENT) protected _document: Document,
  ) {
    super(internalLinkService, searchManager, platformId, _window);
  }

  ngOnInit() {
    super.ngOnInit();

    if (isPlatformServer(this.platformId)) {
      this.counterData$ = of([]);
      return;
    }

    this.counterData$.pipe(
      map(data => data.filter(counter => parseInt(counter.count, 10) > 0).length),
      take(1),
    ).subscribe((numberOfCounters) => {
      if (numberOfCounters <= 3) {
        this._document.documentElement.style.setProperty('--ds-counters-max-columns-per-row', '3');
      } else {
        this._document.documentElement.style.setProperty('--ds-counters-max-columns-per-row', '2');
      }
    });
  }
}
