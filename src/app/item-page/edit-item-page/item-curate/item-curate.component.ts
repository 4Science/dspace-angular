import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RemoteData } from '../../../core/data/remote-data';
import { ActivatedRoute } from '@angular/router';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { filter, map, take } from 'rxjs/operators';
import { hasValue } from '../../../shared/empty.util';
import { Item } from '../../../core/shared/item.model';

@Component({
  selector: 'ds-item-curate',
  templateUrl: './item-curate.component.html'
})
export class ItemCurateComponent implements OnInit {

  dsoRD$: Observable<RemoteData<Item>>;
  itemName$: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private dsoNameService: DSONameService,
  ) {
  }

  ngOnInit(): void {
    this.dsoRD$ = this.route.parent.data.pipe(
      take(1),
      map((data) => data.dso),
    );

    this.itemName$ = this.dsoRD$.pipe(
      filter((rd: RemoteData<Item>) => hasValue(rd)),
      map((rd: RemoteData<Item>) => {
        return this.dsoNameService.getName(rd.payload);
      })
    );
  }

}
