import { TestBed } from '@angular/core/testing';

import { UnpaywallItemService } from './unpaywall-item.service';
import { DefaultChangeAnalyzer } from './default-change-analyzer.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestService } from './request.service';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { storeModuleConfig } from '../../app.reducer';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { UUIDService } from '../shared/uuid.service';
import { requestReducer } from './request.reducer';
import { of } from 'rxjs';
import { RemoteData } from './remote-data';
import { UnpaywallItemVersionModel } from '../submission/models/unpaywall-item-version.model';
import { RequestEntryState } from './request-entry-state.model';
import { RequestEntry } from './request-entry.model';
import { Item } from '../shared/item.model';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service.stub';
import { UnCacheableObject } from '../shared/uncacheable-object.model';
import { RequestServiceStub } from '../../shared/testing/request-service.stub';

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
      buildFromRequestUUID: jasmine.createSpy()
    });
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CommonModule,
        StoreModule.forRoot(requestReducer, storeModuleConfig),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
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
        { provide: RequestService, useValue: requestService }
      ]
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
      license: 'cc-by'
    } as UnpaywallItemVersionModel;

    beforeEach(() => {
      const pendingRequestRemoteData = {
        state: RequestEntryState.RequestPending,
      } as RemoteData<UnpaywallItemVersionModel[]>;
      const successfulRequestRemoteData = {
        state: RequestEntryState.Success,
        response: {
          unCacheableObject: {
            versions: [version]
          } as UnCacheableObject
        }
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
          }
        }
      } as Item;
      service.getItemVersions(item).subscribe(versions => {
        expect(versions).toEqual([version]);
      });
    });
  });
});
