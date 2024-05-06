import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataSchemaSearchFormComponent } from './metadata-schema-search-form.component';
import { FormBuilderService } from '../../../../shared/form/builder/form-builder.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { EventEmitter } from '@angular/core';

describe('MetadataSchemaSearchFormComponent', () => {
  let component: MetadataSchemaSearchFormComponent;
  let fixture: ComponentFixture<MetadataSchemaSearchFormComponent>;

  const translateServiceStub = {
    get: () => observableOf('test-message'),
    onLangChange: new EventEmitter(),
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetadataSchemaSearchFormComponent],
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        {provide: FormBuilderService, useValue: {}},
        {provide: TranslateService, useValue: translateServiceStub},
      ]
    })
      .compileComponents();
  })
  ;

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataSchemaSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
