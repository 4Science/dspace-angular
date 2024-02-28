import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataSchemaSeacrhFormComponent } from './metadata-schema-seacrh-form.component';

describe('MetadataSchemaSeacrhFormComponent', () => {
  let component: MetadataSchemaSeacrhFormComponent;
  let fixture: ComponentFixture<MetadataSchemaSeacrhFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetadataSchemaSeacrhFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataSchemaSeacrhFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
