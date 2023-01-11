import { Component, Inject, Input, OnInit } from '@angular/core';

import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NativeWindowRef, NativeWindowService } from '../../../../../../../app/core/services/window.service';
import { DSpaceObject } from '../../../../../../../app/core/shared/dspace-object.model';
import { getFirstSucceededRemoteDataPayload } from '../../../../../../../app/core/shared/operators';
import { SectionComponent } from '../../../../../../../app/core/layout/models/section.model';
import { SearchService } from '../../../../../../../app/core/shared/search/search.service';
import { hasValue } from '../../../../../../../app/shared/empty.util';
import { PaginationComponentOptions } from '../../../../../../../app/shared/pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from '../../../../../../../app/shared/search/models/paginated-search-options.model';
import { SearchObjects } from '../../../../../../../app/shared/search/models/search-objects.model';
import { CountersSection, CounterData, CountersSettings } from '../../../../../../../app/shared/explore/section-component/counters-section/counters-section.component';

@Component({
  selector: 'ds-counters-section',
  templateUrl: './counters-section.component.html'
})
export class CountersSectionComponent implements OnInit {

  @Input()
  sectionId: string;

  @Input()
  countersSection: CountersSection;

  counterData: CounterData[] = [];
  counterData$: Observable<CounterData[]>;
  isLoading$ = new BehaviorSubject(true);

  pagination: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'counters-pagination',
    pageSize: 1,
    currentPage: 1
  });


  constructor(private searchService: SearchService, @Inject(NativeWindowService) protected _window: NativeWindowRef,) {

  }

  ngOnInit() {
    console.log(this.countersSection);
    this.counterData$ = forkJoin(
      this.countersSection.counterSettingsList.map((counterSettings: CountersSettings) =>
        this.searchService.search(new PaginatedSearchOptions({
          configuration: counterSettings.discoveryConfigurationName,
          pagination: this.pagination})).pipe(
          getFirstSucceededRemoteDataPayload(),
          map((rs: SearchObjects<DSpaceObject>) => rs.totalElements),
          map((total: number) => {
            return {
              count: total.toString(),
              label: counterSettings.entityName,
              icon: counterSettings.icon,
              link: counterSettings.link

            };
          })
        )));
    this.counterData$.subscribe(() => this.isLoading$.next(false));
  }

  goToLink(link: string) {
    if (hasValue(link)) {
      this._window.nativeWindow.location.href = link;
    }
  }
}
