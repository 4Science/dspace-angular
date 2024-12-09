import { BitstreamDataService } from './../../../../../../../core/data/bitstream-data.service';
import { Item } from './../../../../../../../core/shared/item.model';
import { FieldRenderingType } from './../metadata-box.decorator';
import { LayoutField } from './../../../../../../../core/layout/models/box.model';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageComponent } from './image.component';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from './../../../../../../../shared/mocks/translate-loader.mock';
import { createSuccessfulRemoteDataObject$ } from './../../../../../../../shared/remote-data.utils';
import { createPaginatedList } from './../../../../../../../shared/testing/utils.test';
import { Bitstream } from './../../../../../../../core/shared/bitstream.model';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  const testItem = Object.assign(new Item(), {
    bundles: of({}),
    metadata: {
      'dc.identifier.doi': [
        {
          value: 'doi:10.1392/dironix'
        }
      ]
    },
    _links: {
      self: { href: 'obj-selflink' }
    },
    uuid: 'item-uuid',
  });

  const mockField: LayoutField = {
    metadata: '',
    label: 'Files',
    rendering: FieldRenderingType.IMAGE,
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

  const mockBitstreamDataService: any = jasmine.createSpyObj('BitstreamDataService', {
    findAllByItemAndBundleName: jasmine.createSpy('findAllByItemAndBundleName'),
    findByItem: jasmine.createSpy('findByItem'),
  });

  const bitstream = Object.assign(new Bitstream(), {
    id: 'bitstream4',
    uuid: 'bitstream4',
    metadata: {
      'dc.title': [
        {
          value: 'test'
        }
      ],
      'dc.type': [
        {
          value: 'test'
        }
      ],
      'dc.description': [
        {
          value: 'test'
        }
      ]
    },
    _links: {
      self: { href: 'obj-selflink' }
    }
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [ ImageComponent ],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'renderingSubTypeProvider', useValue: '' },
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
        { provide: 'tabNameProvider', useValue: '' },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    mockBitstreamDataService.findAllByItemAndBundleName.and.returnValues(createSuccessfulRemoteDataObject$(createPaginatedList([bitstream])));
    mockBitstreamDataService.findByItem.and.returnValues(createSuccessfulRemoteDataObject$(createPaginatedList([bitstream])));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
