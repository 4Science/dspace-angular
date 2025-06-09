import { EventEmitter } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  DYNAMIC_FORM_CONTROL_MAP_FN,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import { provideMockStore } from '@ngrx/store/testing';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import {
  APP_CONFIG,
  APP_DATA_SERVICES_MAP,
} from '../../../../../config/app-config.interface';
import { environment } from '../../../../../environments/environment';
import { SubmissionObjectDataService } from '../../../../core/submission/submission-object-data.service';
import { dsDynamicFormControlMapFn } from '../../../../shared/form/builder/ds-dynamic-form-ui/ds-dynamic-form-control-map-fn';
import { FormBuilderService } from '../../../../shared/form/builder/form-builder.service';
import { FormComponent } from '../../../../shared/form/form.component';
import { getMockFormBuilderService } from '../../../../shared/mocks/form-builder-service.mock';
import { mockDynamicFormValidationService } from '../../../../shared/testing/dynamic-form-mock-services';
import { SubmissionService } from '../../../../submission/submission.service';
import { MetadataSchemaSearchFormComponent } from './metadata-schema-search-form.component';

describe('MetadataSchemaSearchFormComponent', () => {
  let component: MetadataSchemaSearchFormComponent;
  let fixture: ComponentFixture<MetadataSchemaSearchFormComponent>;

  const translateServiceStub = {
    get: () => observableOf('test-message'),
    onLangChange: new EventEmitter(),
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MetadataSchemaSearchFormComponent,
      ],
      providers: [
        { provide: FormBuilderService, useValue: getMockFormBuilderService() },
        { provide: APP_DATA_SERVICES_MAP, useValue: {} },
        { provide: APP_CONFIG, useValue: environment },
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: SubmissionObjectDataService, useValue: {} },
        { provide: SubmissionService, useValue: {} },
        { provide: DYNAMIC_FORM_CONTROL_MAP_FN, useValue: dsDynamicFormControlMapFn },
        { provide: DynamicFormValidationService, useValue: mockDynamicFormValidationService },
        provideMockStore({ }),
      ],
    })
      .overrideComponent(MetadataSchemaSearchFormComponent, {
        remove: {
          imports: [FormComponent],
        },
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
