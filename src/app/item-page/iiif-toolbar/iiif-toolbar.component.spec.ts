import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IIIFToolbarComponent } from './iiif-toolbar.component';

describe('IiifToolbarComponent', () => {
  let component: IIIFToolbarComponent;
  let fixture: ComponentFixture<IIIFToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IIIFToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IIIFToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
