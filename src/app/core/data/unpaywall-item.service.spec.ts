import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { of } from 'rxjs';

import { APP_DATA_SERVICES_MAP } from '../../../config/app-config.interface';
import { storeModuleConfig } from '../../app.reducer';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service.stub';
import { RequestServiceStub } from '../../shared/testing/request-service.stub';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Item } from '../shared/item.model';
import { UnCacheableObject } from '../shared/uncacheable-object.model';
import { UUIDService } from '../shared/uuid.service';
import { UnpaywallItemVersionModel } from '../submission/models/unpaywall-item-version.model';
import { DefaultChangeAnalyzer } from './default-change-analyzer.service';
import { RemoteData } from './remote-data';
import { requestReducer } from './request.reducer';
import { RequestService } from './request.service';
import { RequestEntry } from './request-entry.model';
import { RequestEntryState } from './request-entry-state.model';
import { UnpaywallItemService } from './unpaywall-item.service';

const endpointUrl = 'http://test-url.com';
const requestId = '8a6e0804-2bd0-4672-b79d-d97027f9071a';

describe('UnpaywallItemService', () => {
  let service: UnpaywallItemService;
  let halService;
  let requestService;
  let remoteDataBuildService;

  beforeEach(() => {
    requestService = new RequestServiceStub();
    halService = new HALEndpointServiceStub(endpointUrl);
    remoteDataBuildService = jasmine.createSpyObj({
      buildFromRequestUUID: jasmine.createSpy(),
    });
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        StoreModule.forRoot(requestReducer, storeModuleConfig),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
      ],
      providers: [
        UnpaywallItemService,
        DefaultChangeAnalyzer,
        NotificationsService,
        ObjectCacheService,
        UUIDService,
        { provide: HALEndpointService, useValue: halService },
        { provide: RemoteDataBuildService, useValue: remoteDataBuildService },
        { provide: RequestService, useValue: requestService },
        { provide: APP_DATA_SERVICES_MAP, useValue: {} },
      ],
    });
    service = TestBed.inject(UnpaywallItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItemVersions', () => {

    const version = {
      version: 'publishedVersion',
      hostType: 'repository',
      landingPageUrl: 'http://test.com/landing-page',
      pdfUrl: 'http://test.com/pdf',
      license: 'cc-by',
    } as UnpaywallItemVersionModel;

    beforeEach(() => {
      const pendingRequestRemoteData = {
        state: RequestEntryState.RequestPending,
      } as RemoteData<UnpaywallItemVersionModel[]>;
      const successfulRequestRemoteData = {
        state: RequestEntryState.Success,
        response: {
          unCacheableObject: {
            versions: [version],
          } as UnCacheableObject,
        },
      } as RequestEntry;

      spyOn(halService, 'getEndpoint').and.returnValue(of(endpointUrl));
      spyOn(requestService, 'generateRequestId').and.returnValue(requestId);
      spyOn(requestService, 'getByUUID').and.returnValue(of(successfulRequestRemoteData));
      spyOn(requestService, 'send').and.returnValue(true);
      remoteDataBuildService.buildFromRequestUUID.and.returnValue(of(pendingRequestRemoteData));
    });

    it('should retrieve versions of the item provided by Unpaywall API', () => {
      const item = {
        id: requestId,
        _links: {
          self: {
            href: 'dso-href',
          },
        },
      } as Item;
      service.getItemVersions(item).subscribe(versions => {
        expect(versions).toEqual([version]);
      });
    });
  });
});
