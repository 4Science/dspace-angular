import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { environment } from '../../../../../../environments/environment';
import { BrowseService } from '@dspace/core';
import { BrowseDefinitionDataService } from '@dspace/core';
import { APP_CONFIG } from '@dspace/core';
import { ActivatedRouteStub } from '@dspace/core';
import { BrowseDefinitionDataServiceStub } from '@dspace/core';
import { BrowseServiceStub } from '@dspace/core';
import { TranslateLoaderMock } from '../../../../../../../modules/core/src/lib/core/utilities/testing/translate-loader.mock';
import { MetadataValuesComponent } from '../../../../field-components/metadata-values/metadata-values.component';
import { mockItemWithMetadataFieldsAndValue } from '../item-page-field.component.spec';
import { ItemPageAuthorFieldComponent } from './item-page-author-field.component';

let comp: ItemPageAuthorFieldComponent;
let fixture: ComponentFixture<ItemPageAuthorFieldComponent>;

const mockFields = ['dc.contributor.author', 'dc.creator', 'dc.contributor'];
const mockValue = 'test value';

describe('ItemPageAuthorFieldComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock,
        },
      }), ItemPageAuthorFieldComponent, MetadataValuesComponent],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
        { provide: BrowseDefinitionDataService, useValue: BrowseDefinitionDataServiceStub },
        { provide: BrowseService, useValue: BrowseServiceStub },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemPageAuthorFieldComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  for (const field of mockFields) {
    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(ItemPageAuthorFieldComponent);
      comp = fixture.componentInstance;
      comp.item = mockItemWithMetadataFieldsAndValue([field], mockValue);
      fixture.detectChanges();
    }));

    describe(`when the item contains metadata for ${field}`, () => {
      it('should display display the correct metadata value', () => {
        expect(fixture.nativeElement.innerHTML).toContain(mockValue);
      });
    });
  }
});
