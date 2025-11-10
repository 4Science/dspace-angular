import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CcLicenseSmallComponent } from './cc-license-small.component';

describe('CcLicenseSmallComponent', () => {
  let component: CcLicenseSmallComponent;
  let fixture: ComponentFixture<CcLicenseSmallComponent>;

  const mockItem = {
    firstMetadataValue: jasmine.createSpy('firstMetadataValue').and.returnValue(''),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      declarations: [CcLicenseSmallComponent],
      providers: [
        {
          provide: 'fieldProvider',
          useValue: {},
        },
        {
          provide: 'itemProvider',
          useValue: mockItem,
        },
        {
          provide: 'metadataValueProvider',
          useValue: {},
        },
        {
          provide: 'renderingSubTypeProvider',
          useValue: {},
        },
        {
          provide: 'tabNameProvider',
          useValue: {},
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CcLicenseSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
