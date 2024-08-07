import {
  ChangeDetectorRef,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { ObjectCacheService } from '../../../core/cache/object-cache.service';
import { RestResponse } from '../../../core/cache/response.models';
import { BitstreamDataService } from '../../../core/data/bitstream-data.service';
import { BundleDataService } from '../../../core/data/bundle-data.service';
import { ItemDataService } from '../../../core/data/item-data.service';
import { FieldChangeType } from '../../../core/data/object-updates/field-change-type.model';
import { ObjectUpdatesService } from '../../../core/data/object-updates/object-updates.service';
import { RequestService } from '../../../core/data/request.service';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { Bundle } from '../../../core/shared/bundle.model';
import { Item } from '../../../core/shared/item.model';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { getMockRequestService } from '../../../shared/mocks/request.service.mock';
import {
  INotification,
  Notification,
} from '../../../shared/notifications/models/notification.model';
import { NotificationType } from '../../../shared/notifications/models/notification-type';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '../../../shared/remote-data.utils';
import { BitstreamDataServiceStub } from '../../../shared/testing/bitstream-data-service.stub';
import { RouterStub } from '../../../shared/testing/router.stub';
import { createPaginatedList } from '../../../shared/testing/utils.test';
import { ObjectValuesPipe } from '../../../shared/utils/object-values-pipe';
import { VarDirective } from '../../../shared/utils/var.directive';
import { ItemBitstreamsComponent } from './item-bitstreams.component';

let comp: ItemBitstreamsComponent;
let fixture: ComponentFixture<ItemBitstreamsComponent>;

const infoNotification: INotification = new Notification('id', NotificationType.Info, 'info');
const warningNotification: INotification = new Notification('id', NotificationType.Warning, 'warning');
const successNotification: INotification = new Notification('id', NotificationType.Success, 'success');
const bitstream1 = Object.assign(new Bitstream(), {
  id: 'bitstream1',
  uuid: 'bitstream1',
});
const bitstream2 = Object.assign(new Bitstream(), {
  id: 'bitstream2',
  uuid: 'bitstream2',
});
const fieldUpdate1 = {
  field: bitstream1,
  changeType: undefined,
};
const fieldUpdate2 = {
  field: bitstream2,
  changeType: FieldChangeType.REMOVE,
};
const bundle = Object.assign(new Bundle(), {
  id: 'bundle1',
  uuid: 'bundle1',
  _links: {
    self: { href: 'bundle1-selflink' },
  },
  bitstreams: createSuccessfulRemoteDataObject$(createPaginatedList([bitstream1, bitstream2])),
});
const moveOperations = [
  {
    op: 'move',
    from: '/0',
    path: '/1',
  },
];
const date = new Date();
const url = 'thisUrl';
let item: Item;
let itemService: ItemDataService;
let objectUpdatesService: ObjectUpdatesService;
let router: any;
let route: ActivatedRoute;
let notificationsService: NotificationsService;
let bitstreamService: BitstreamDataServiceStub;
let objectCache: ObjectCacheService;
let requestService: RequestService;
let searchConfig: SearchConfigurationService;
let bundleService: BundleDataService;

describe('ItemBitstreamsComponent', () => {
  beforeEach(waitForAsync(() => {
    objectUpdatesService = jasmine.createSpyObj('objectUpdatesService',
      {
        getFieldUpdates: observableOf({
          [bitstream1.uuid]: fieldUpdate1,
          [bitstream2.uuid]: fieldUpdate2,
        }),
        getFieldUpdatesExclusive: observableOf({
          [bitstream1.uuid]: fieldUpdate1,
          [bitstream2.uuid]: fieldUpdate2,
        }),
        saveAddFieldUpdate: {},
        discardFieldUpdates: {},
        discardAllFieldUpdates: {},
        reinstateFieldUpdates: observableOf(true),
        initialize: {},
        getUpdatedFields: observableOf([bitstream1, bitstream2]),
        getLastModified: observableOf(date),
        hasUpdates: observableOf(true),
        isReinstatable: observableOf(false),
        isValidPage: observableOf(true),
        getMoveOperations: observableOf(moveOperations),
      },
    );
    router = Object.assign(new RouterStub(), {
      url: url,
    });
    notificationsService = jasmine.createSpyObj('notificationsService',
      {
        info: infoNotification,
        warning: warningNotification,
        success: successNotification,
      },
    );
    bitstreamService = new BitstreamDataServiceStub();
    objectCache = jasmine.createSpyObj('objectCache', {
      remove: jasmine.createSpy('remove'),
    });
    requestService = getMockRequestService();
    searchConfig = Object.assign({
      paginatedSearchOptions: observableOf({}),
    });

    item = Object.assign(new Item(), {
      uuid: 'item',
      id: 'item',
      _links: {
        self: { href: 'item-selflink' },
      },
      bundles: createSuccessfulRemoteDataObject$(createPaginatedList([bundle])),
      lastModified: date,
    });
    itemService = Object.assign({
      getBitstreams: () => createSuccessfulRemoteDataObject$(createPaginatedList([bitstream1, bitstream2])),
      findByHref: () => createSuccessfulRemoteDataObject$(item),
      findById: () => createSuccessfulRemoteDataObject$(item),
      getBundles: () => createSuccessfulRemoteDataObject$(createPaginatedList([bundle])),
    });
    route = Object.assign({
      parent: {
        data: observableOf({ dso: createSuccessfulRemoteDataObject(item) }),
      },
      data: observableOf({}),
      url: url,
    });
    bundleService = jasmine.createSpyObj('bundleService', {
      patch: observableOf(new RestResponse(true, 200, 'OK')),
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ItemBitstreamsComponent, ObjectValuesPipe, VarDirective],
      providers: [
        { provide: ItemDataService, useValue: itemService },
        { provide: ObjectUpdatesService, useValue: objectUpdatesService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: BitstreamDataService, useValue: bitstreamService },
        { provide: ObjectCacheService, useValue: objectCache },
        { provide: RequestService, useValue: requestService },
        { provide: SearchConfigurationService, useValue: searchConfig },
        { provide: BundleDataService, useValue: bundleService },
        ChangeDetectorRef,
      ], schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemBitstreamsComponent);
    comp = fixture.componentInstance;
    comp.url = url;
    fixture.detectChanges();
  });

  describe('when submit is called', () => {
    beforeEach(() => {
      spyOn(bitstreamService, 'removeMultiple').and.callThrough();
      comp.submit();
    });

    it('should call removeMultiple on the bitstreamService for the marked field', () => {
      expect(bitstreamService.removeMultiple).toHaveBeenCalledWith([bitstream2]);
    });

    it('should not call removeMultiple on the bitstreamService for the unmarked field', () => {
      expect(bitstreamService.removeMultiple).not.toHaveBeenCalledWith([bitstream1]);
    });
  });

  describe('when dropBitstream is called', () => {
    beforeEach((done) => {
      comp.dropBitstream(bundle, {
        fromIndex: 0,
        toIndex: 50,
        finish: () => {
          done();
        },
      });
    });

    it('should send out a patch for the move operation', () => {
      expect(bundleService.patch).toHaveBeenCalled();
    });
  });

  describe('discard', () => {
    it('should discard ALL field updates', () => {
      comp.discard();
      expect(objectUpdatesService.discardAllFieldUpdates).toHaveBeenCalled();
    });
  });

  describe('reinstate', () => {
    it('should reinstate field updates on the bundle', () => {
      comp.reinstate();
      expect(objectUpdatesService.reinstateFieldUpdates).toHaveBeenCalledWith(bundle.self);
    });
  });
});
