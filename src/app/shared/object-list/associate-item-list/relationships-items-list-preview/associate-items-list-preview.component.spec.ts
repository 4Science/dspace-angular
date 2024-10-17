import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateItemsListPreviewComponent } from './associate-items-list-preview.component';

describe('AssociateItemsListPreviewComponent', () => {
  let component: AssociateItemsListPreviewComponent;
  let fixture: ComponentFixture<AssociateItemsListPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociateItemsListPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateItemsListPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
