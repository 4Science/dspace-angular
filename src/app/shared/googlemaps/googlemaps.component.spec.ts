import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GooglemapsComponent } from './googlemaps.component';

describe('GooglemapsComponent', () => {
  let component: GooglemapsComponent;
  let fixture: ComponentFixture<GooglemapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GooglemapsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GooglemapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
