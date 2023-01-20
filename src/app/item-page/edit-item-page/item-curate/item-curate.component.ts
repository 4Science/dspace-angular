import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RemoteData } from '../../../core/data/remote-data';
import { ActivatedRoute } from '@angular/router';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { filter, map, take } from 'rxjs/operators';
import { hasValue } from '../../../shared/empty.util';
import { Item } from '../../../core/shared/item.model';
import { getAllSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { getItemPageRoute } from '../../item-page-routing-paths';

@Component({
  selector: 'ds-item-curate',
  templateUrl: './item-curate.component.html'
})
export class ItemCurateComponent implements OnInit {

  itemRD$: Observable<RemoteData<Item>>;
  itemName$: Observable<string>;

  itemPageRoute$: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private dsoNameService: DSONameService,
  ) {
  }

  ngOnInit(): void {
    this.itemRD$ = this.route.parent.data.pipe(
      take(1),
      map((data) => data.dso),
    );

    this.itemPageRoute$ = this.itemRD$.pipe(
      getAllSucceededRemoteDataPayload(),
      map((item) => getItemPageRoute(item))
    );

    this.itemName$ = this.itemRD$.pipe(
      filter((rd: RemoteData<Item>) => hasValue(rd)),
      map((rd: RemoteData<Item>) => {
        return this.dsoNameService.getName(rd.payload);
      })
    );
  }

}
