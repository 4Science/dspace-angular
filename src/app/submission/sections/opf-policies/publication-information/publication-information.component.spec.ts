import { TranslateLoaderMock } from '../../../../shared/testing/translate-loader.mock';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationInformationComponent } from './publication-information.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { OpfDataResponse } from '../../../../shared/mocks/section-opf-policies.service.mock';

describe('PublicationInformationComponent', () => {
  let component: PublicationInformationComponent;
  let fixture: ComponentFixture<PublicationInformationComponent>;
  let de: DebugElement;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
      ],
      declarations: [PublicationInformationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicationInformationComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    component.journal = OpfDataResponse.opfResponse.journals[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show 6 rows', () => {
    expect(de.queryAll(By.css('.row')).length).toEqual(6);
  });

});
