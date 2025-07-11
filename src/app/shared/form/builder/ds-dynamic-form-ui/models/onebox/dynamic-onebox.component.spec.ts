/* eslint-disable max-classes-per-file */
// Load the implementations that should be tested
import { CdkTreeModule } from '@angular/cdk/tree';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DebugElement,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  inject,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicFormLayoutService,
  DynamicFormsCoreModule,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import { DynamicFormsNGBootstrapUIModule } from '@ng-dynamic-forms/ui-ng-bootstrap';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { getTestScheduler } from 'jasmine-marbles';
import { of as observableOf } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { v4 as uuidv4 } from 'uuid';

import { APP_DATA_SERVICES_MAP } from '../../../../../../../config/app-config.interface';
import { SubmissionScopeType } from '../../../../../../core/submission/submission-scope-type';
import { Vocabulary } from '../../../../../../core/submission/vocabularies/models/vocabulary.model';
import { VocabularyEntry } from '../../../../../../core/submission/vocabularies/models/vocabulary-entry.model';
import { VocabularyOptions } from '../../../../../../core/submission/vocabularies/models/vocabulary-options.model';
import { VocabularyService } from '../../../../../../core/submission/vocabularies/vocabulary.service';
import { SubmissionService } from '../../../../../../submission/submission.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../remote-data.utils';
import {
  mockDynamicFormLayoutService,
  mockDynamicFormValidationService,
} from '../../../../../testing/dynamic-form-mock-services';
import { SubmissionServiceStub } from '../../../../../testing/submission-service.stub';
import { createTestComponent } from '../../../../../testing/utils.test';
import { VocabularyServiceStub } from '../../../../../testing/vocabulary-service.stub';
import { ObjNgFor } from '../../../../../utils/object-ngfor.pipe';
import { AuthorityConfidenceStateDirective } from '../../../../directives/authority-confidence-state.directive';
import { FormBuilderService } from '../../../form-builder.service';
import { FormFieldMetadataValueObject } from '../../../models/form-field-metadata-value.model';
import { DsDynamicOneboxComponent } from './dynamic-onebox.component';
import { DynamicOneboxModel } from './dynamic-onebox.model';

export let ONEBOX_TEST_GROUP;

export let ONEBOX_TEST_MODEL_CONFIG;


const validAuthority = uuidv4();

// Mock class for NgbModalRef
export class MockNgbModalRef {
  componentInstance = {
    vocabularyOptions: undefined,
    preloadLevel: undefined,
    selectedItem: undefined,
  };
  result: Promise<any> = new Promise((resolve, reject) => resolve(true));
}

function init() {
  ONEBOX_TEST_GROUP = new UntypedFormGroup({
    onebox: new UntypedFormControl(),
  });

  ONEBOX_TEST_MODEL_CONFIG = {
    vocabularyOptions: {
      closed: false,
      name: 'vocabulary',
    } as VocabularyOptions,
    disabled: false,
    id: 'onebox',
    label: 'Conference',
    minChars: 3,
    name: 'onebox',
    placeholder: 'Conference',
    readOnly: false,
    required: false,
    repeatable: false,
    value: undefined,
  };
}

describe('DsDynamicOneboxComponent test suite', () => {

  let scheduler: TestScheduler;
  let testComp: TestComponent;
  let oneboxComponent: DsDynamicOneboxComponent;
  let testFixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let oneboxCompFixture: ComponentFixture<DsDynamicOneboxComponent>;
  let vocabularyServiceStub: any;
  let modalService: any;
  let html;
  let modal;
  const vocabulary = Object.assign(new Vocabulary(), {
    id: 'vocabulary',
    name: 'vocabulary',
    scrollable: true,
    hierarchical: false,
    preloadLevel: 0,
    type: 'vocabulary',
    _links: {
      self: {
        url: 'self',
      },
      entries: {
        url: 'entries',
      },
    },
  });
  const vocabularyExternal: any = Object.assign(new Vocabulary(), {
    id: 'author',
    name: 'author',
    scrollable: true,
    hierarchical: false,
    preloadLevel: 1,
    entity: 'test',
    externalSource: {
      onebox: 'authorExternalSource',
    },
    type: 'vocabulary',
    uuid: 'vocabulary-author',
    _links: {
      self: {
        href: 'https://rest.api/rest/api/submission/vocabularies/types',
      },
      entries: {
        href: 'https://rest.api/rest/api/submission/vocabularies/types/entries',
      },
    },
  });
  const hierarchicalVocabulary = Object.assign(new Vocabulary(), {
    id: 'hierarchicalVocabulary',
    name: 'hierarchicalVocabulary',
    scrollable: true,
    hierarchical: true,
    preloadLevel: 2,
    type: 'vocabulary',
    _links: {
      self: {
        url: 'self',
      },
      entries: {
        url: 'entries',
      },
    },
  });

  // waitForAsync beforeEach
  beforeEach(() => {
    vocabularyServiceStub = new VocabularyServiceStub();

    modal = jasmine.createSpyObj('modal',
      {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
        dismiss: jasmine.createSpy('dismiss'),
      },
    );
    init();
    TestBed.configureTestingModule({
      imports: [
        DynamicFormsCoreModule,
        DynamicFormsNGBootstrapUIModule,
        FormsModule,
        NgbModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        CdkTreeModule,
        DsDynamicOneboxComponent,
        TestComponent,
        AuthorityConfidenceStateDirective,
        ObjNgFor,
      ],
      providers: [
        ChangeDetectorRef,
        { provide: VocabularyService, useValue: vocabularyServiceStub },
        { provide: DynamicFormLayoutService, useValue: mockDynamicFormLayoutService },
        { provide: DynamicFormValidationService, useValue: mockDynamicFormValidationService },
        { provide: NgbModal, useValue: modal },
        { provide: FormBuilderService },
        { provide: SubmissionService, useClass: SubmissionServiceStub },
        { provide: APP_DATA_SERVICES_MAP, useValue: {} },
        provideMockStore({ initialState: { core: { index: { } } } }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

  });

  describe('', () => {
    // synchronous beforeEach
    beforeEach(() => {
      html = `
      <ds-dynamic-onebox [bindId]="bindId"
                            [group]="group"
                            [model]="model"
                            (blur)="onBlur($event)"
                            (change)="onValueChange($event)"
                            (focus)="onFocus($event)"></ds-dynamic-onebox>`;

      spyOn(vocabularyServiceStub, 'findVocabularyById').and.returnValue(createSuccessfulRemoteDataObject$(vocabulary));
      testFixture = createTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;
      testComp = testFixture.componentInstance;
    });

    afterEach(() => {
      testFixture.destroy();
    });
    it('should create DsDynamicOneboxComponent', () => {
      expect(testComp).toBeDefined();
    });
  });

  describe('Has not hierarchical vocabulary', () => {
    beforeEach(() => {
      spyOn(vocabularyServiceStub, 'findVocabularyById').and.returnValue(createSuccessfulRemoteDataObject$(vocabulary));
    });

    describe('when init model value is empty', () => {
      beforeEach(() => {

        oneboxCompFixture = TestBed.createComponent(DsDynamicOneboxComponent);
        debugElement = oneboxCompFixture.debugElement;
        oneboxComponent = oneboxCompFixture.componentInstance; // FormComponent test instance
        oneboxComponent.group = ONEBOX_TEST_GROUP;
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);
        oneboxCompFixture.detectChanges();
      });

      afterEach(() => {
        oneboxCompFixture.destroy();
        oneboxComponent = null;
      });

      it('should init component properly', () => {
        const testElement = debugElement.query(By.css('i.fa-share-square'));
        expect(testElement).toBeNull();
        expect(oneboxComponent.currentValue).not.toBeDefined();
      });

      it('should search when 3+ characters typed', fakeAsync(() => {

        spyOn((oneboxComponent as any).vocabularyService, 'getVocabularyEntriesByValue').and.callThrough();

        oneboxComponent.search(observableOf('test')).subscribe();

        tick(300);
        oneboxCompFixture.detectChanges();

        expect((oneboxComponent as any).vocabularyService.getVocabularyEntriesByValue).toHaveBeenCalled();
      }));

      it('should set model.value on input type when VocabularyOptions.closed is false', () => {
        const inputDe = oneboxCompFixture.debugElement.query(By.css('input.form-control'));
        const inputElement = inputDe.nativeElement;

        inputElement.value = 'test value';
        inputElement.dispatchEvent(new Event('input'));

        expect(oneboxComponent.inputValue).toEqual(new FormFieldMetadataValueObject('test value'));

      });

      it('should not set model.value on input type when VocabularyOptions.closed is true', () => {
        oneboxComponent.model.vocabularyOptions.closed = true;
        oneboxCompFixture.detectChanges();
        const inputDe = oneboxCompFixture.debugElement.query(By.css('input.form-control'));
        const inputElement = inputDe.nativeElement;

        inputElement.value = 'test value';
        inputElement.dispatchEvent(new Event('input'));

        expect(oneboxComponent.model.value).not.toBeDefined();

      });

      it('should emit blur Event onBlur when popup is closed', () => {
        spyOn(oneboxComponent.blur, 'emit');
        spyOn(oneboxComponent.instance, 'isPopupOpen').and.returnValue(false);
        oneboxComponent.onBlur(new Event('blur'));
        expect(oneboxComponent.blur.emit).toHaveBeenCalled();
      });

      it('should not emit blur Event onBlur when popup is opened', () => {
        spyOn(oneboxComponent.blur, 'emit');
        spyOn(oneboxComponent.instance, 'isPopupOpen').and.returnValue(true);
        const input = oneboxCompFixture.debugElement.query(By.css('input'));

        input.nativeElement.blur();
        expect(oneboxComponent.blur.emit).not.toHaveBeenCalled();
      });

      it('should emit change Event onBlur when VocabularyOptions.closed is false and inputValue is changed', () => {
        oneboxComponent.inputValue = 'test value';
        oneboxCompFixture.detectChanges();
        spyOn(oneboxComponent.blur, 'emit');
        spyOn(oneboxComponent.change, 'emit');
        spyOn(oneboxComponent.instance, 'isPopupOpen').and.returnValue(false);
        oneboxComponent.onBlur(new Event('blur'));
        expect(oneboxComponent.change.emit).toHaveBeenCalled();
        expect(oneboxComponent.blur.emit).toHaveBeenCalled();
      });

      it('should not emit change Event onBlur when VocabularyOptions.closed is false and inputValue is not changed', () => {
        oneboxComponent.inputValue = 'test value';
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);
        (oneboxComponent.model as any).value = 'test value';
        oneboxCompFixture.detectChanges();
        spyOn(oneboxComponent.blur, 'emit');
        spyOn(oneboxComponent.change, 'emit');
        spyOn(oneboxComponent.instance, 'isPopupOpen').and.returnValue(false);
        oneboxComponent.onBlur(new Event('blur'));
        expect(oneboxComponent.change.emit).not.toHaveBeenCalled();
        expect(oneboxComponent.blur.emit).toHaveBeenCalled();
      });

      it('should not emit change Event onBlur when VocabularyOptions.closed is false and inputValue is null', () => {
        oneboxComponent.inputValue = null;
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);
        (oneboxComponent.model as any).value = 'test value';
        oneboxCompFixture.detectChanges();
        spyOn(oneboxComponent.blur, 'emit');
        spyOn(oneboxComponent.change, 'emit');
        spyOn(oneboxComponent.instance, 'isPopupOpen').and.returnValue(false);
        oneboxComponent.onBlur(new Event('blur'));
        expect(oneboxComponent.change.emit).not.toHaveBeenCalled();
        expect(oneboxComponent.blur.emit).toHaveBeenCalled();
      });

      it('should emit focus Event onFocus', () => {
        spyOn(oneboxComponent.focus, 'emit');
        oneboxComponent.onFocus(new Event('focus'));
        expect(oneboxComponent.focus.emit).toHaveBeenCalled();
      });

    });

    describe('when init model value is not empty', () => {
      beforeEach(() => {
        oneboxCompFixture = TestBed.createComponent(DsDynamicOneboxComponent);
        oneboxComponent = oneboxCompFixture.componentInstance; // FormComponent test instance
        oneboxComponent.group = ONEBOX_TEST_GROUP;
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);
        const entry = observableOf(Object.assign(new VocabularyEntry(), {
          authority: null,
          value: 'test',
          display: 'testDisplay',
        }));
        spyOn((oneboxComponent as any).vocabularyService, 'getVocabularyEntryByValue').and.returnValue(entry);
        spyOn((oneboxComponent as any).vocabularyService, 'getVocabularyEntryByID').and.returnValue(entry);
        (oneboxComponent.model as any).value = new FormFieldMetadataValueObject('test', null, null, null, 'testDisplay');
        oneboxCompFixture.detectChanges();
      });

      afterEach(() => {
        oneboxCompFixture.destroy();
        oneboxComponent = null;
      });

      it('should init component properly', fakeAsync(() => {
        tick();
        expect(oneboxComponent.currentValue).toEqual(new FormFieldMetadataValueObject('test', null, null, null, 'testDisplay'));
        expect((oneboxComponent as any).vocabularyService.getVocabularyEntryByValue).not.toHaveBeenCalled();
      }));

      it('should emit change Event onChange and currentValue is empty', () => {
        oneboxComponent.currentValue = null;
        spyOn(oneboxComponent.change, 'emit');
        oneboxComponent.onChange(new Event('change'));
        expect(oneboxComponent.change.emit).toHaveBeenCalled();
        expect(oneboxComponent.model.value).toBeNull();
      });
    });

    describe('when init model value is not empty and has authority', () => {
      beforeEach(() => {
        oneboxCompFixture = TestBed.createComponent(DsDynamicOneboxComponent);
        oneboxComponent = oneboxCompFixture.componentInstance; // FormComponent test instance
        oneboxComponent.group = ONEBOX_TEST_GROUP;
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);
        const entry = observableOf(Object.assign(new VocabularyEntry(), {
          authority: validAuthority,
          value: 'test',
          display: 'test',
        }));
        spyOn((oneboxComponent as any).vocabularyService, 'getVocabularyEntryByValue').and.returnValue(entry);
        spyOn((oneboxComponent as any).vocabularyService, 'getVocabularyEntryByID').and.returnValue(entry);
        (oneboxComponent.model as any).value = new FormFieldMetadataValueObject('test', null, null, validAuthority);
        oneboxCompFixture.detectChanges();
      });

      afterEach(() => {
        oneboxCompFixture.destroy();
        oneboxComponent = null;
      });

      it('should init component properly', fakeAsync(() => {
        tick();
        expect(oneboxComponent.currentValue).toEqual(new FormFieldMetadataValueObject('test', null, null, validAuthority, 'test'));
        expect((oneboxComponent as any).vocabularyService.getVocabularyEntryByID).not.toHaveBeenCalled();
      }));

      it('should emit change Event onChange and currentValue is empty', () => {
        oneboxComponent.currentValue = null;
        spyOn(oneboxComponent.change, 'emit');
        oneboxComponent.onChange(new Event('change'));
        expect(oneboxComponent.change.emit).toHaveBeenCalled();
        expect(oneboxComponent.model.value).toBeNull();
      });
    });
  });

  xdescribe('Has hierarchical vocabulary', () => {
    beforeEach(() => {
      scheduler = getTestScheduler();
      spyOn(vocabularyServiceStub, 'findVocabularyById').and.returnValue(createSuccessfulRemoteDataObject$(hierarchicalVocabulary));
      oneboxCompFixture = TestBed.createComponent(DsDynamicOneboxComponent);
      oneboxComponent = oneboxCompFixture.componentInstance; // FormComponent test instance
      modalService = TestBed.inject(NgbModal);
      modalService.open.and.returnValue(new MockNgbModalRef());
    });

    describe('when init model value is empty', () => {
      beforeEach(() => {
        oneboxComponent.group = ONEBOX_TEST_GROUP;
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);
        oneboxCompFixture.detectChanges();
      });

      afterEach(() => {
        oneboxCompFixture.destroy();
        oneboxComponent = null;
      });

      it('should init component properly', fakeAsync(() => {
        tick();
        expect(oneboxComponent.currentValue).not.toBeDefined();
      }));

      it('should open tree properly', (done) => {
        scheduler.schedule(() => oneboxComponent.openTree(new Event('click')));
        scheduler.flush();

        expect((oneboxComponent as any).modalService.open).toHaveBeenCalled();
        done();
      });
    });

    describe('when init model value is not empty', () => {
      beforeEach(() => {
        oneboxComponent.group = ONEBOX_TEST_GROUP;
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);
        const entry = observableOf(Object.assign(new VocabularyEntry(), {
          authority: null,
          value: 'test',
          display: 'testDisplay',
        }));
        spyOn((oneboxComponent as any).vocabularyService, 'getVocabularyEntryByValue').and.returnValue(entry);
        spyOn((oneboxComponent as any).vocabularyService, 'getVocabularyEntryByID').and.returnValue(entry);
        (oneboxComponent.model as any).value = new FormFieldMetadataValueObject('test', null, null, null, 'testDisplay');
        oneboxCompFixture.detectChanges();
      });

      afterEach(() => {
        oneboxCompFixture.destroy();
        oneboxComponent = null;
      });

      it('should init component properly', fakeAsync(() => {
        tick();
        expect(oneboxComponent.currentValue).toEqual(new FormFieldMetadataValueObject('test', null, null, null, 'testDisplay'));
        expect((oneboxComponent as any).vocabularyService.getVocabularyEntryByValue).toHaveBeenCalled();
      }));

      it('should open tree properly', (done) => {
        scheduler.schedule(() => oneboxComponent.openTree(new Event('click')));
        scheduler.flush();

        expect((oneboxComponent as any).modalService.open).toHaveBeenCalled();
        done();
      });
    });

  });

  describe('Has vocabulary with external source', () => {
    beforeEach(() => {
      spyOn(vocabularyServiceStub, 'findVocabularyById').and.returnValue(createSuccessfulRemoteDataObject$(vocabularyExternal));
      oneboxCompFixture = TestBed.createComponent(DsDynamicOneboxComponent);
      debugElement = oneboxCompFixture.debugElement;
      oneboxComponent = oneboxCompFixture.componentInstance; // FormComponent test instance
      oneboxComponent.group = ONEBOX_TEST_GROUP;
      oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);
    });

    describe('and submission scope is workspaceitem', () => {
      beforeEach(() => {
        oneboxComponent.model.submissionScope = SubmissionScopeType.WorkspaceItem;
        oneboxCompFixture.detectChanges();
      });

      it('should not display external source button', inject([FormBuilderService], (service: FormBuilderService) => {
        const testElement = debugElement.query(By.css('i.fa-share-square'));
        expect(testElement).toBeNull();
      }));
    });

    describe('and submission scope is workflowitem', () => {
      beforeEach(() => {
        oneboxComponent.model.submissionScope = SubmissionScopeType.WorkflowItem;
        oneboxCompFixture.detectChanges();
      });

      it('should display external source button', inject([FormBuilderService], (service: FormBuilderService) => {
        const testElement = debugElement.query(By.css('i.fa-share-square'));
        expect(testElement).not.toBeNull();
      }));
    });

    describe('selectAlternativeInformation', () => {
      beforeEach(() => {
        oneboxCompFixture = TestBed.createComponent(DsDynamicOneboxComponent);
        debugElement = oneboxCompFixture.debugElement;
        oneboxComponent = oneboxCompFixture.componentInstance;
        oneboxComponent.currentValue = new FormFieldMetadataValueObject('test', null, null, null, 'testDisplay');
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);

        spyOn(oneboxComponent, 'onSelectItem').and.returnValue(undefined);
        spyOn(oneboxComponent, 'toggleOtherInfoSelection').and.returnValue(undefined);
      });

      it('sets authority when unformattedOtherInfoValue contains "::"', () => {
        const info = 'testInfo';
        const unformattedItem = 'testInfo::authorityValue';
        oneboxComponent.otherInfoValuesUnformatted = [unformattedItem];

        oneboxComponent.selectAlternativeInfo(info);

        expect(oneboxComponent.currentValue.authority).toBe('authorityValue');
      });

      it('sets authority to undefined when unformattedOtherInfoValue does not contain "::"', () => {
        const info = 'testInfo';
        const unformattedItem = 'testInfo';
        oneboxComponent.otherInfoValuesUnformatted = [unformattedItem];

        oneboxComponent.selectAlternativeInfo(info);

        expect(oneboxComponent.currentValue.authority).toBeUndefined();
      });
    });

    describe('test metadata enrichment', () => {
      beforeEach(() => {
        oneboxCompFixture = TestBed.createComponent(DsDynamicOneboxComponent);
        debugElement = oneboxCompFixture.debugElement;
        oneboxComponent = oneboxCompFixture.componentInstance;
        oneboxComponent.currentValue = new FormFieldMetadataValueObject('test', null, null, null, 'testDisplay');
        oneboxComponent.model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);

        spyOn(oneboxComponent, 'onSelectItem').and.returnValue(undefined);
        spyOn(oneboxComponent, 'toggleOtherInfoSelection').and.returnValue(undefined);
      });


      it('should return null if value is empty', () => {
        expect(oneboxComponent.getOtherInformationValue('', 'some-key')).toBeNull();
      });

      it('should return null if key is "alternative-names"', () => {
        expect(oneboxComponent.getOtherInformationValue('some-value', 'alternative-names')).toBeNull();
      });

      it('should return single FormFieldMetadataValueObject if no "|||" in value', () => {
        const result = oneboxComponent.getOtherInformationValue('value::authority', 'some-key');
        expect(result.length).toBe(1);
        expect(result[0]).toEqual(jasmine.any(FormFieldMetadataValueObject));
        expect(result[0].value).toBe('value');
        expect(result[0].authority).toBe('authority');
      });

      it('should handle multiple values with multiValueOnGenerator true', () => {
        oneboxComponent.multiValueOnGenerator = true;
        (oneboxComponent as any).otherInfoValue = 'someValue';
        const result = oneboxComponent.getOtherInformationValue('val1::auth1|||val2::auth2', 'some-key');
        expect(result.length).toBe(2);
        expect(result[0].value).toBe('val1');
        expect(result[0].authority).toBe('auth1');
        expect(result[1].value).toBe('val2');
        expect(result[1].authority).toBe('auth2');
      });

      it('should handle multiple values with multiValueOnGenerator false', () => {
        oneboxComponent.multiValueOnGenerator = false;
        (oneboxComponent as any).otherInfoValue = 'val1';
        oneboxComponent.otherInfoValuesUnformatted = ['val1::auth1'];
        const result = oneboxComponent.getOtherInformationValue('val1::auth1|||val2::auth2', 'data-key');
        expect(result.length).toBe(1);
        expect(result[0].value).toBe('val1');
        expect(result[0].authority).toBe('auth1');
        expect(result[0].otherInformation['data-key']).toBe('val1::auth1|||val2::auth2');
      });

      it('should handle value without "::"', () => {
        const result = oneboxComponent.getOtherInformationValue('simpleValue', 'some-key');
        expect(result.length).toBe(1);
        expect(result[0].value).toBe('simpleValue');
        expect(result[0].authority).toBeNull();
      });

    });
  });
});

// declare a test component
@Component({
  selector: 'ds-test-cmp',
  template: ``,
  standalone: true,
  imports: [DynamicFormsCoreModule,
    DynamicFormsNGBootstrapUIModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    CdkTreeModule],
})
class TestComponent {

  group: UntypedFormGroup = ONEBOX_TEST_GROUP;

  model = new DynamicOneboxModel(ONEBOX_TEST_MODEL_CONFIG);

}

