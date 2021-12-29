import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrisrefMoreComponent } from './crisref-more.component';

describe('CrisrefMoreComponent', () => {
  let component: CrisrefMoreComponent;
  let fixture: ComponentFixture<CrisrefMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrisrefMoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisrefMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
