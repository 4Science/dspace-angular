import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrisLayoutMediaBoxComponent } from './cris-layout-media-box.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoaderMock } from '../../../../../shared/mocks/translate-loader.mock';
import { boxMetadata } from '../../../../../shared/testing/box.mock';
import { Item } from '../../../../../core/shared/item.model';

describe('CrisLayoutMediaBoxComponent', () => {
  let component: CrisLayoutMediaBoxComponent;
  let fixture: ComponentFixture<CrisLayoutMediaBoxComponent>;

  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'dc.title': [{
          'value': 'test item title',
          'language': null,
          'authority': null,
          'confidence': -1,
          'place': 0
        }]
      },
      uuid: 'test-item-uuid',
    }
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrisLayoutMediaBoxComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      providers: [
        { provide: 'boxProvider', useValue: boxMetadata },
        { provide: 'itemProvider', useValue: testItem },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisLayoutMediaBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
