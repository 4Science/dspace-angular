import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataSchemaSearchFormComponent } from './metadata-schema-search-form.component';

describe('MetadataSchemaSearchFormComponent', () => {
  let component: MetadataSchemaSearchFormComponent;
  let fixture: ComponentFixture<MetadataSchemaSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataSchemaSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataSchemaSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
