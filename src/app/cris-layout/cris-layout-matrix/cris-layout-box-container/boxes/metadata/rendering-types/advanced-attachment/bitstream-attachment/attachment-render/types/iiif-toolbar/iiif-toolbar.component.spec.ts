import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { AuthorizationDataService } from '../../../../../../../../../../../core/data/feature-authorization/authorization-data.service';
import { buildPaginatedList } from '../../../../../../../../../../../core/data/paginated-list.model';
import { Item } from '../../../../../../../../../../../core/shared/item.model';
import { PageInfo } from '../../../../../../../../../../../core/shared/page-info.model';
import { createRelationshipsObservable } from '../../../../../../../../../../../item-page/simple/item-types/shared/item.component.spec';
import { NotificationsService } from '../../../../../../../../../../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../../../../../../../shared/remote-data.utils';
import { AuthorizationDataServiceStub } from '../../../../../../../../../../../shared/testing/authorization-service.stub';
import { NotificationsServiceStub } from '../../../../../../../../../../../shared/testing/notifications-service.stub';
import { IIIFToolbarComponent } from './iiif-toolbar.component';
import { MockBitstream1 } from '../../../../../../../../../../../shared/mocks/item.mock';
import { Bitstream } from '../../../../../../../../../../../core/shared/bitstream.model';
import { MetadataValue } from '../../../../../../../../../../../core/shared/metadata.models';

describe('IiifToolbarComponent', () => {
  let component: IIIFToolbarComponent;
  let fixture: ComponentFixture<IIIFToolbarComponent>;
  let translateService: TranslateService;

  const mockBitstream: Bitstream = MockBitstream1;

  const mockItem: Item = Object.assign(new Item(), {
    bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
    metadata: {
      'publicationissue.issueNumber': [
        {
          language: 'en_US',
          value: '1234',
        },
      ],
      'creativework.datePublished': [
        {
          language: 'en_US',
          value: '2018',
        },
      ],
      'dc.description': [
        {
          language: 'en_US',
          value: 'desc',
        },
      ],
      'creativework.keywords': [
        {
          language: 'en_US',
          value: 'keyword',
        },
      ],
    },
    relationships: createRelationshipsObservable(),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), TranslateModule.forRoot(), IIIFToolbarComponent],
      providers: [
        { provide: NotificationsService, useValue: NotificationsServiceStub },
        { provide: AuthorizationDataService, useClass: AuthorizationDataServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IIIFToolbarComponent);
    component = fixture.componentInstance;
    component.item = mockItem;
    component.bitstream = mockBitstream;
    component.getObjectUrl = () => 'https://test-url.com';
    fixture.detectChanges();

    translateService = (component as any).translate;
    spyOn(translateService, 'get').and.returnValue(observableOf('translated-message'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get canvasId from metadata', () => {
    component.bitstream = Object.assign(new Bitstream(), mockBitstream, {
      metadata: {
        'bitstream.iiif.canvasid': [
          Object.assign(new MetadataValue(), {
            language: null,
            value: 'testCanvasId',
            authority: 'someAuthority',
          }),
        ],
      }
    });
    const expectedQueryParams = {
      canvasId: 'testCanvasId',
    };
    component.ngOnInit();
    expect(component.queryParams).toEqual(expectedQueryParams);
  });

  it('should get canvasId from uuid', () => {
    const expectedQueryParams = {
      canvasId: mockBitstream.uuid,
    };
    component.ngOnInit();
    expect(component.queryParams).toEqual(expectedQueryParams);
  });
});
