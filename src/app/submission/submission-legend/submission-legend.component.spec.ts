import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionLegendComponent } from './submission-legend.component';

describe('SubmissionLegendComponent', () => {
  let component: SubmissionLegendComponent;
  let fixture: ComponentFixture<SubmissionLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmissionLegendComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
