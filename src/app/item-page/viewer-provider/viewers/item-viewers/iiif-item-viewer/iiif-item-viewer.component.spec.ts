import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IIIFItemViewerComponent } from './iiif-item-viewer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
describe('IiifItemViewerComponent', () => {
  let component: IIIFItemViewerComponent;
  let fixture: ComponentFixture<IIIFItemViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IIIFItemViewerComponent ],
      imports: [ RouterTestingModule.withRoutes([]) ],
      providers: [
        {provide: Store, useValue: provideMockStore()}
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
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
