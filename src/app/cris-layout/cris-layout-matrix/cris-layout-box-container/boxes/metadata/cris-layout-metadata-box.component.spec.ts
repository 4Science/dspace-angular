import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { Item } from '../../../../../core/shared/item.model';
import { TranslateLoaderMock } from '../../../../../shared/mocks/translate-loader.mock';
import { boxMetadata } from '../../../../../shared/testing/box.mock';
import { CrisLayoutLoaderDirective } from '../../../../directives/cris-layout-loader.directive';
import { CrisLayoutMetadataBoxComponent } from './cris-layout-metadata-box.component';
import { TextComponent } from './rendering-types/text/text.component';
import { RowComponent } from './row/row.component';

describe('CrisLayoutMetadataBoxComponent', () => {
  let component: CrisLayoutMetadataBoxComponent;
  let fixture: ComponentFixture<CrisLayoutMetadataBoxComponent>;

  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'dc.title': [{
          'value': 'test item title',
          'language': null,
          'authority': null,
          'confidence': -1,
          'place': 0,
        }],
      },
      uuid: 'test-item-uuid',
    },
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock,
        },
      }),
      BrowserAnimationsModule, CrisLayoutMetadataBoxComponent,
      CrisLayoutLoaderDirective,
      RowComponent,
      TextComponent],
      providers: [
        { provide: 'boxProvider', useValue: boxMetadata },
        { provide: 'itemProvider', useValue: testItem },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(CrisLayoutMetadataBoxComponent, { remove: { imports: [RowComponent] } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisLayoutMetadataBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('check rows rendering', (done) => {
    const rowsFound = fixture.debugElement.queryAll(By.css('div[ds-row]'));

    expect(rowsFound.length).toEqual(2);
    done();
  });
});
