import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import {
  DynamicFormControlModel,
  DynamicFormGroupModel,
  DynamicFormLayout,
  DynamicInputModel
} from '@ng-dynamic-forms/core';
import { FormGroup } from '@angular/forms';
import { FormBuilderService } from '../../../../shared/form/builder/form-builder.service';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Subject } from 'rxjs';
import { SchemaFilter } from './schema-filter';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ds-metadata-schema-search-form',
  templateUrl: './metadata-schema-search-form.component.html'
})
export class MetadataSchemaSearchFormComponent implements OnInit, OnDestroy {

  /**
   * A unique id used for ds-form
   */
  formId = 'metadata-schema-search-form';

  /**
   * The prefix for all messages related to this form
   */
  messagePrefix = 'admin.registries.metadata.search.form';

  /**
   * A dynamic input model for the namespace field
   */
  namespace: DynamicInputModel;

  /**
   * A dynamic input model for the element field
   */
  element: DynamicInputModel;

  /**
   * A dynamic input model for the qualifier field
   */
  qualifier: DynamicInputModel;

  /**
   * A list of all dynamic input models
   */
  formModel: DynamicFormControlModel[];

  /**
   * Layout used for structuring the form inputs
   */
  formLayout: DynamicFormLayout = {
    namespace: {
      grid: {
        host: 'col col-sm-4 d-inline-block'
      }
    },
    element: {
      grid: {
        host: 'col col-sm-4 d-inline-block'
      }
    },
    qualifier: {
      grid: {
        host: 'col col-sm-4 d-inline-block'
      }
    }
  };

  /**
   * A FormGroup that combines all inputs
   */
  formGroup: FormGroup;

  /**
   * An EventEmitter that's fired whenever the form is being submitted
   */
  @Output() submitForm: EventEmitter<SchemaFilter> = new EventEmitter<SchemaFilter>();

  /**
   * Subject for unsubscribing observables.
   */
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private formBuilderService: FormBuilderService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    combineLatest(
      this.translateService.get(`${this.messagePrefix}.namespace`),
      this.translateService.get(`${this.messagePrefix}.element`),
      this.translateService.get(`${this.messagePrefix}.qualifier`)
    ).subscribe(([namespace, element, qualifier]) => {
      this.namespace = new DynamicInputModel({
        id: 'namespace',
        label: namespace,
        name: 'namespace',
        required: false,
      });
      this.element = new DynamicInputModel({
        id: 'element',
        label: element,
        name: 'element',
        required: false,
      });
      this.qualifier = new DynamicInputModel({
        id: 'qualifier',
        label: qualifier,
        name: 'qualifier',
        required: false,
      });
      this.formModel = [
        new DynamicFormGroupModel(
          {
            id: 'metadatadataschemasearchgroup',
            group: [this.namespace, this.element, this.qualifier]
          })
      ];
      this.formGroup = this.formBuilderService.createFormGroup(this.formModel);
      this.formGroup.patchValue({
        metadatadataschemasearchgroup: {
          namespace: '',
          element: '',
          qualifier: ''
        } as SchemaFilter
      });
      this.formGroup.valueChanges.pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      ).subscribe(() => this.onSubmit());
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private onSubmit(): void {
    const filter = {
      // we need to add ' ', otherwise '/' at the end of the row would be trimmed by the URLCombiner
      namespace: this.namespace.value + ' ',
      element: this.element.value,
      qualifier: this.qualifier.value
    } as SchemaFilter;
    this.submitForm.emit(filter);
  }

}
