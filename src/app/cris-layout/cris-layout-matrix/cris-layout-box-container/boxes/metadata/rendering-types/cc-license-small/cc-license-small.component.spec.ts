import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { CcLicenseSmallComponent } from './cc-license-small.component';

describe('CcLicenseSmallComponent', () => {
  let component: CcLicenseSmallComponent;
  let fixture: ComponentFixture<CcLicenseSmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcLicenseSmallComponent],
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
