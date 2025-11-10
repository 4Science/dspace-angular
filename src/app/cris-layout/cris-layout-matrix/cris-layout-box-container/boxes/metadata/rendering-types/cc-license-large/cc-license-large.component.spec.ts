import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { CcLicenseLargeComponent } from './cc-license-large.component';

describe('CcLicenseLargeComponent', () => {
  let component: CcLicenseLargeComponent;
  let fixture: ComponentFixture<CcLicenseLargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CcLicenseLargeComponent],
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
