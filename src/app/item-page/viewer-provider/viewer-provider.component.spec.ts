import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerProviderComponent } from './viewer-provider.component';

describe('ViewerProviderComponent', () => {
  let component: ViewerProviderComponent;
  let fixture: ComponentFixture<ViewerProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerProviderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
