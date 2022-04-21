import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrisLayoutIIIFToolbarBoxComponent } from './cris-layout-iiif-toolbar-box.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { getMockTranslateService } from '../../../../../shared/mocks/translate.service.mock';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateLoaderMock } from '../../../../../shared/mocks/translate-loader.mock';

fdescribe('CrisLayoutIiifToolbarBoxComponent', () => {
  let component: CrisLayoutIIIFToolbarBoxComponent;
  let fixture: ComponentFixture<CrisLayoutIIIFToolbarBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [ CrisLayoutIIIFToolbarBoxComponent ],
      providers: [
        { provide: 'boxProvider', useValue: {} },
        { provide: 'itemProvider', useValue: {} },
        { provide: TranslateService, useValue: getMockTranslateService() },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisLayoutIIIFToolbarBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
