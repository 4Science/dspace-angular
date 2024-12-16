import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MediaItemViewerComponent } from './media-item-viewer.component';

describe('MediaItemViewerComponent', () => {
  let component: MediaItemViewerComponent;
  let fixture: ComponentFixture<MediaItemViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MediaItemViewerComponent,
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaItemViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
