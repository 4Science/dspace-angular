import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsInfoComponent } from './cms-info.component';

describe('CmsInfoComponent', () => {
  let component: CmsInfoComponent;
  let fixture: ComponentFixture<CmsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CmsInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
