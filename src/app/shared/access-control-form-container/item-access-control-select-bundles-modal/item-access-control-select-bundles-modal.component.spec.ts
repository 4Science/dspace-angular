import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
} from 'rxjs';

import { BundleDataService } from '../../../core/data/bundle-data.service';
import { FindListOptions } from '../../../core/data/find-list-options.model';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { RemoteData } from '../../../core/data/remote-data';
import { Bundle } from '../../../core/shared/bundle.model';
import { Item } from '../../../core/shared/item.model';
import { ObjectCollectionComponent } from '../../object-collection/object-collection.component';
import { createSuccessfulRemoteDataObject$ } from '../../remote-data.utils';
import { createPaginatedList } from '../../testing/utils.test';
import { FollowLinkConfig } from '../../utils/follow-link-config.model';
import { ItemAccessControlSelectBundlesModalComponent } from './item-access-control-select-bundles-modal.component';

describe('ItemAccessControlSelectBundlesModalComponent', () => {
  let component: ItemAccessControlSelectBundlesModalComponent;
  let fixture: ComponentFixture<ItemAccessControlSelectBundlesModalComponent>;

  const mockBundleDataService = {
    findAllByItem(item: Item, options?: FindListOptions, ...linksToFollow: FollowLinkConfig<Bundle>[]): Observable<RemoteData<PaginatedList<Bundle>>> {
      return createSuccessfulRemoteDataObject$(createPaginatedList([]));
    },
  };



  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemAccessControlSelectBundlesModalComponent, MockTranslatePipe],
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        NgbActiveModal,
        { provide: BundleDataService, useValue: mockBundleDataService },
      ],
    })
      .overrideComponent(ItemAccessControlSelectBundlesModalComponent, {
        remove: {
          imports: [ObjectCollectionComponent],
        },
        add: {
          imports: [MockTranslatePipe],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemAccessControlSelectBundlesModalComponent);
    component = fixture.componentInstance;
    component.item = new Item();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch bundles on init', () => {
    spyOn(component.bundleService, 'findAllByItem').and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([])));
    component.ngOnInit();
    expect(component.bundleService.findAllByItem).toHaveBeenCalled();
  });
});

@Pipe({
  // eslint-disable-next-line @angular-eslint/pipe-prefix
  name: 'translate',
})
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}
