import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';

import { BundleDataService } from '../../../core/data/bundle-data.service';
import { Bundle } from '../../../core/shared/bundle.model';
import { Item } from '../../../core/shared/item.model';
import { hasValue } from '../../empty.util';
import { ObjectCollectionComponent } from '../../object-collection/object-collection.component';
import { PaginationComponentOptions } from '../../pagination/pagination-component-options.model';

export const ITEM_ACCESS_CONTROL_SELECT_BUNDLES_LIST_ID = 'item-access-control-select-bundles';

@Component({
  selector: 'ds-item-access-control-select-bundles-modal',
  templateUrl: './item-access-control-select-bundles-modal.component.html',
  standalone: true,
  imports: [NgIf, ObjectCollectionComponent, AsyncPipe, TranslateModule],
})
export class ItemAccessControlSelectBundlesModalComponent implements OnInit {

  LIST_ID = ITEM_ACCESS_CONTROL_SELECT_BUNDLES_LIST_ID;

  @Input() item!: Item;
  bundles$ = new BehaviorSubject<RemoteData<PaginatedList<Bundle>> | null>(null);
  paginationConfig = new PaginationComponentOptions();


  constructor(
    public activeModal: NgbActiveModal,
    public bundleService: BundleDataService,
  ) {
    this.paginationConfig.id = this.LIST_ID;
  }

  ngOnInit() {
    if (hasValue(this.item)) {
      this.bundleService.findAllByItem(this.item).pipe(take(1)).subscribe((bundles) => {
        this.bundles$.next(bundles);
      });
    }
  }
}
