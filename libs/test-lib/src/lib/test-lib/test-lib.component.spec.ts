import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestLibComponent } from './test-lib.component';

describe('TestLibComponent', () => {
  let component: TestLibComponent;
  let fixture: ComponentFixture<TestLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestLibComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
