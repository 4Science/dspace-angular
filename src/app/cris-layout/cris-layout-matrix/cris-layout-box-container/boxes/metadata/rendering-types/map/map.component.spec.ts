import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LayoutField } from 'src/app/core/layout/models/box.model';
import { Item } from 'src/app/core/shared/item.model';
import { MetadataValue } from 'src/app/core/shared/metadata.models';
import { TranslateLoaderMock } from 'src/app/shared/mocks/translate-loader.mock';
import { MapComponent } from './map.component';

fdescribe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  const metadataValue = Object.assign(new MetadataValue(), {
    'value': '@42.1334,56.7654',
    'language': null,
    'authority': null,
    'confidence': -1,
    'place': 0
  });

  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'organization.address.addressLocality': [metadataValue]
      },
      uuid: 'test-item-uuid',
    }
  );

  const mockField: LayoutField = {
    'metadata': 'organization.address.addressLocality',
    'label': 'Preferred name',
    'rendering': 'MAP',
    'fieldType': 'METADATA',
    'style': null,
    'styleLabel': 'test-style-label',
    'styleValue': 'test-style-value',
    'labelAsHeading': false,
    'valuesInline': true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }), BrowserAnimationsModule],
      providers: [
        { provide: 'fieldProvider', useValue: mockField },
        { provide: 'itemProvider', useValue: testItem },
        { provide: 'metadataValueProvider', useValue: metadataValue },
        { provide: 'renderingSubTypeProvider', useValue: '' },
      ],
      declarations: [ MapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should rendered google map.',() => {
    const container = fixture.debugElement.query(By.css('#googlemap'));
    expect(container).toBeTruthy();
  });

});
