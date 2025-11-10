import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CcLicenseLargeComponent } from './cc-license-large.component';

describe('CcLicenseLargeComponent', () => {
  let component: CcLicenseLargeComponent;
  let fixture: ComponentFixture<CcLicenseLargeComponent>;

  const mockItem = {
    firstMetadataValue: jasmine.createSpy('firstMetadataValue').and.returnValue(''),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CcLicenseLargeComponent,
        TranslateModule.forRoot(),
      ],
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

    fixture = TestBed.createComponent(CcLicenseLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
