import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BackgroundComponent } from './background.component';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { FieldRenderingType } from '../metadata-box.decorator';
import { Item } from '../../../../../../../core/shared/item.model';
import { ObjectCacheService } from '../../../../../../../core/cache/object-cache.service';
import { getMockObjectCacheService } from '../../../../../../../shared/mocks/object-cache.service.mock';
import { UUIDService } from '../../../../../../../core/shared/uuid.service';
import { getMockUUIDService } from '../../../../../../../shared/mocks/uuid.service.mock';
import { provideMockStore } from '@ngrx/store/testing';
import { getMockRemoteDataBuildService } from '../../../../../../../shared/mocks/remote-data-build.service.mock';
import { RemoteDataBuildService } from '../../../../../../../core/cache/builders/remote-data-build.service';
import { HALEndpointService } from '../../../../../../../core/shared/hal-endpoint.service';
import { DSOChangeAnalyzer } from '../../../../../../../core/data/dso-change-analyzer.service';
import { BitstreamFormatDataService } from '../../../../../../../core/data/bitstream-format-data.service';
import { NotificationsService } from '../../../../../../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { HALEndpointServiceStub } from '../../../../../../../shared/testing/hal-endpoint-service.stub';


describe('BackgroundComponent ', () => {
  let component: BackgroundComponent;
  let fixture: ComponentFixture<BackgroundComponent>;

  const mockField: LayoutField = {
    metadata: '',
    label: 'Files',
    rendering: FieldRenderingType.ADVANCEDATTACHMENT,
    fieldType: 'BITSTREAM',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true,
    bitstream: {
      bundle: 'ORIGINAL',
      metadataField: null,
      metadataValue: null
    }
  };

  const testItem = Object.assign(new Item(), {
    type: 'item',
    entityType: 'Publication',
    metadata: {
      'dc.title': [{
        'value': 'test item title',
        'language': null,
        'authority': null,
        'confidence': -1,
        'place': 0
      }],
      'dspace.iiif.enabled': [{
        'value': 'true',
        'language': null,
        'authority': null,
        'confidence': 0,
        'place': 0,
        'securityLevel': 0,
      }]
    },
    uuid: 'test-item-uuid',
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BackgroundComponent],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: 'tabNameProvider', useValue: ''},
        { provide: ObjectCacheService, useValue: getMockObjectCacheService() },
        { provide: UUIDService, useValue: getMockUUIDService() },
        { provide: RemoteDataBuildService, useValue: getMockRemoteDataBuildService() },
        { provide: HALEndpointService, useValue: new HALEndpointServiceStub('workspaceitems') },
        { provide: DSOChangeAnalyzer, useValue: {} },
        { provide: BitstreamFormatDataService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: TranslateService, useValue: {} },
        provideMockStore({ core: { auth: { loading: false } } } as any)
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
