import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitterSectionComponent } from './twitter-section.component';

describe('TwitterSectionComponent', () => {
  let component: TwitterSectionComponent;
  let fixture: ComponentFixture<TwitterSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwitterSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitterSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
