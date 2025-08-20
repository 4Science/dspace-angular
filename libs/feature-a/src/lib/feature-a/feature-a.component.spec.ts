import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureAComponent } from './feature-a.component';

describe('FeatureAComponent', () => {
  let component: FeatureAComponent;
  let fixture: ComponentFixture<FeatureAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureAComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
