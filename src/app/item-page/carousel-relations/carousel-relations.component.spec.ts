import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselRelationsComponent } from './carousel-relations.component';

describe('CarouselRelationsComponent', () => {
  let component: CarouselRelationsComponent;
  let fixture: ComponentFixture<CarouselRelationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarouselRelationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselRelationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
