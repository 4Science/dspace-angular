import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { hasValue } from '@dspace/shared/utils';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  filter,
  map,
  take,
} from 'rxjs/operators';

import { DSONameService } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { Item } from '@dspace/core';
import { CurationFormComponent } from '../../../curation-form/curation-form.component';

/**
 * Component for managing a collection's curation tasks
 */
@Component({
  selector: 'ds-item-curate',
  templateUrl: './item-curate.component.html',
  imports: [
    CurationFormComponent,
    TranslateModule,
    AsyncPipe,
  ],
  standalone: true,
})
export class ItemCurateComponent implements OnInit {
  dsoRD$: Observable<RemoteData<Item>>;
  itemName$: Observable<string>;

  constructor(
    private route: ActivatedRoute,
    private dsoNameService: DSONameService,
  ) {}

  ngOnInit(): void {
    this.dsoRD$ = this.route.parent.data.pipe(
      take(1),
      map((data) => data.dso),
    );

    this.itemName$ = this.dsoRD$.pipe(
      filter((rd: RemoteData<Item>) => hasValue(rd)),
      map((rd: RemoteData<Item>) => {
        return this.dsoNameService.getName(rd.payload);
      }),
    );
  }
}
