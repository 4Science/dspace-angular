import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { Audit } from '../../core/audit/model/audit.model';
import { AuditDataService } from '../../core/data/audit-data.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
//import { APP_DATA_SERVICES_MAP } from '../../core/data-services-map-type';
import { PaginationService } from '../../core/pagination/pagination.service';
import { Item } from '../../core/shared/item.model';
import { MockActivatedRoute } from '../../shared/mocks/active-router.mock';
import { RouterMock } from '../../shared/mocks/router.mock';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { AuditMock } from '../../shared/testing/audit.mock';
import { PaginationServiceStub } from '../../shared/testing/pagination-service.stub';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { AuditTableComponent } from '../audit-table/audit-table.component';
import { ObjectAuditLogsComponent } from './object-audit-logs.component';

describe('ObjectAuditLogsComponent', () => {
  let component: ObjectAuditLogsComponent;
  let fixture: ComponentFixture<ObjectAuditLogsComponent>;

  let auditService: AuditDataService;
  let audits: Audit[];
  let dSpaceObjectDataService: DSpaceObjectDataService;
  let collectionService;
  let activatedRoute;
  let locationStub: Location;
  const mockItem = new Item();
  const mockItemId = '1234';
  mockItem.id = mockItemId;

  function init() {
    audits = [ AuditMock ];
    auditService = jasmine.createSpyObj('auditService', {
      findByObject: createSuccessfulRemoteDataObject$(createPaginatedList(audits)),
      getEpersonName: of('Eperson Name'),
      auditHasDetails: false,
      getOtherObject: of(new Audit()),
    });
    dSpaceObjectDataService = jasmine.createSpyObj('DSpaceObjectDataService', { findById: createSuccessfulRemoteDataObject$(mockItem) });
    collectionService = jasmine.createSpyObj('CollectionDataService',
      { findOwningCollectionFor: createSuccessfulRemoteDataObject$(createPaginatedList([{ id : 'collectionId' }])) },
    );
    activatedRoute = new MockActivatedRoute({ objectId: mockItemId });
    activatedRoute.paramMap = of({
      get: () => mockItemId,
    });
    locationStub = jasmine.createSpyObj('location', {
      back: jasmine.createSpy('back'),
    });
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
        AuditTableComponent,
        ObjectAuditLogsComponent,
        RouterLink,
      ],
      providers: [
        { provide: AuditDataService, useValue: auditService },
        { provide: PaginationService, useValue: new PaginationServiceStub() },
        { provide: DSpaceObjectDataService, useValue: dSpaceObjectDataService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: new RouterMock() },
        { provide: CollectionDataService, useValue: collectionService },
        //{ provide: APP_DATA_SERVICES_MAP, useValue: new Map() },
        { provide: Location, useValue: locationStub },
        provideMockStore({}),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ObjectAuditLogsComponent, {
        remove: {
          imports: [AuditTableComponent],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectAuditLogsComponent);
    component = fixture.componentInstance;
    spyOn(component, 'setAudits').and.callThrough();
    fixture.detectChanges();
  });

  describe('object detail data setting', () => {
    it('should set audits on init', fakeAsync(() => {
      tick();
      fixture.detectChanges();
      expect(component.setAudits).toHaveBeenCalled();
    }));

    it('should set object id', (done) => {
      component.objectId$.subscribe((id) => {
        expect(id).toEqual(mockItemId);
        expect(component.objectId).toEqual(id);
        done();
      });
    });
  });
});
