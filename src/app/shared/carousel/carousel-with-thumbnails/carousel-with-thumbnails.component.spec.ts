import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselWithThumbnailsComponent } from './carousel-with-thumbnails.component';

describe('CarouselRelationsComponent', () => {
  let component: CarouselWithThumbnailsComponent;
  let fixture: ComponentFixture<CarouselWithThumbnailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarouselWithThumbnailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselWithThumbnailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
