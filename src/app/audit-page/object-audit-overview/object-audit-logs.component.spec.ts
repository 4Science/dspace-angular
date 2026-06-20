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

import { APP_DATA_SERVICES_MAP } from '../../../config/app-config.interface';
import { Audit } from '../../core/audit/model/audit.model';
import { AuthService } from '../../core/auth/auth.service';
import { AuthRequestService } from '../../core/auth/auth-request.service';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { AuditDataService } from '../../core/data/audit-data.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { ItemDataService } from '../../core/data/item-data.service';
import { PaginationService } from '../../core/pagination/pagination.service';
import { Item } from '../../core/shared/item.model';
import { MockActivatedRoute } from '../../shared/mocks/active-router.mock';
import { RouterMock } from '../../shared/mocks/router.mock';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '../../shared/remote-data.utils';
import { AuditMock } from '../../shared/testing/audit.mock';
import { PaginationServiceStub } from '../../shared/testing/pagination-service.stub';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { AuditTableComponent } from '../audit-table/audit-table.component';
import { ObjectAuditLogsComponent } from './object-audit-logs.component';

describe('ObjectAuditLogsComponent', () => {
  let component: ObjectAuditLogsComponent;
  let fixture: ComponentFixture<ObjectAuditLogsComponent>;

  let auditService: AuditDataService;
  let authRequestService: AuthRequestService;
  let audits: Audit[];
  let dSpaceObjectDataService: DSpaceObjectDataService;
  let itemDataService: ItemDataService;
  let authorizationService: AuthorizationDataService;
  let dsoNameService: DSONameService;
  let authService: AuthService;
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
    itemDataService = jasmine.createSpyObj('ItemDataService', {
      findById: createSuccessfulRemoteDataObject$(mockItem),
    });
    collectionService = jasmine.createSpyObj('CollectionDataService',
      { findOwningCollectionFor: createSuccessfulRemoteDataObject$(createPaginatedList([{ id : 'collectionId' }])) },
    );
    activatedRoute = new MockActivatedRoute({ objectId: mockItemId });
    activatedRoute.paramMap = of({
      get: () => mockItemId,
    });
    activatedRoute.data = of({
      dso: createSuccessfulRemoteDataObject(mockItem),
    });
    locationStub = jasmine.createSpyObj('location', {
      back: jasmine.createSpy('back'),
    });
    authorizationService = jasmine.createSpyObj('AuthorizationDataService', {
      isAuthorized: of(true),
    });
    dsoNameService = jasmine.createSpyObj('DSONameService', {
      getName: 'Test Item',
    });
    authService = jasmine.createSpyObj('AuthService', {
      isAuthenticated: of(true),
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
        { provide: AuthRequestService, useValue: authRequestService },
        { provide: PaginationService, useValue: new PaginationServiceStub() },
        { provide: DSpaceObjectDataService, useValue: dSpaceObjectDataService },
        { provide: ItemDataService, useValue: itemDataService },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: new RouterMock() },
        { provide: CollectionDataService, useValue: collectionService },
        { provide: APP_DATA_SERVICES_MAP, useValue: new Map() },
        { provide: Location, useValue: locationStub },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: DSONameService, useValue: dsoNameService },
        { provide: AuthService, useValue: authService },
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

    it('should set object id', fakeAsync(() => {
      tick();
      fixture.detectChanges();

      component.objectId$.subscribe((id) => {
        expect(id).toEqual(mockItemId);
        expect(component.objectId).toEqual(id);
      });

      tick();
    }));
  });
});
