import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IIIFItemViewerComponent } from './iiif-item-viewer.component';

describe('IiifItemViewerComponent', () => {
  let component: IIIFItemViewerComponent;
  let fixture: ComponentFixture<IIIFItemViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IIIFItemViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IIIFItemViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
