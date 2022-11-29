import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfBitstreamViewerComponent } from './pdf-bitstream-viewer.component';

describe('PdfBitstreamViewerComponent', () => {
  let component: PdfBitstreamViewerComponent;
  let fixture: ComponentFixture<PdfBitstreamViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfBitstreamViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfBitstreamViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
