import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';

import { APP_DATA_SERVICES_MAP } from '../../../config/app-config.interface';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { UUIDService } from '../shared/uuid.service';
import { ResourceService } from './resource.service';

describe('ResourceService', () => {
  let resourceService: ResourceService;
  let httpMock: HttpTestingController;
  let halService: HALEndpointService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HALEndpointService, ObjectCacheService, UUIDService, RemoteDataBuildService,
        { provide: Store, useValue: {} },
        { provide: APP_DATA_SERVICES_MAP, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    resourceService = TestBed.inject(ResourceService);
    httpMock = TestBed.inject(HttpTestingController);
    halService = TestBed.inject(HALEndpointService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(resourceService).toBeTruthy();
  });

  describe('download', () => {
    it('should download a resource', () => {
      const rootHref = 'http://root-href';
      const mockResourceUrl = 'http://url-to-external-sourse';
      const mockBlob = new Blob(['Test data'], { type: 'text/plain' });

      spyOn(halService, 'getRootHref').and.returnValue(rootHref);

      resourceService.download(mockResourceUrl).subscribe((blob: Blob) => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`http://root-href/resource-proxy?externalSourceUrl=http%253A%252F%252Furl-to-external-sourse`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBlob);
    });
  });
});
