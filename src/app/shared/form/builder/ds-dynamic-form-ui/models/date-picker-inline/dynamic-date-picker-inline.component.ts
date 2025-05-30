import {
  NgClass,
  NgIf,
} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import {
  NgbDateParserFormatter,
  NgbDatepicker,
  NgbDatepickerConfig,
  NgbDatepickerModule,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicDatePickerModel,
  DynamicFormControlComponent,
  DynamicFormControlLayout,
  DynamicFormLayoutService,
  DynamicFormValidationService,
} from '@ng-dynamic-forms/core';
import { Subscription } from 'rxjs';

import { BtnDisabledDirective } from '../../../../../btn-disabled.directive';
import { hasValue } from '../../../../../empty.util';
import { FormFieldMetadataValueObject } from '../../../models/form-field-metadata-value.model';

@Component({
  selector: 'ds-dynamic-date-picker-inline',
  styleUrls: ['./dynamic-date-picker-inline.component.scss'],
  templateUrl: './dynamic-date-picker-inline.component.html',
  imports: [
    NgClass,
    NgbDatepickerModule,
    ReactiveFormsModule,
    NgIf,
    BtnDisabledDirective,
  ],
  standalone: true,
})
export class DsDatePickerInlineComponent extends DynamicFormControlComponent implements OnInit, OnDestroy{

  @Input() bindId = true;
  @Input() group: UntypedFormGroup;
  @Input() layout: DynamicFormControlLayout;
  @Input() model: DynamicDatePickerModel;

  @Output() blur: EventEmitter<any> = new EventEmitter();
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() focus: EventEmitter<any> = new EventEmitter();

  @ViewChild(NgbDatepicker) ngbDatePicker: NgbDatepicker;
  formattedDate: string;
  private isOnFocus: boolean;
  private modelChangeSub: Subscription;

  constructor(protected layoutService: DynamicFormLayoutService,
              protected validationService: DynamicFormValidationService,
              public config: NgbDatepickerConfig,
              public formatter: NgbDateParserFormatter) {

    super(layoutService, validationService);
  }

  ngOnInit() {
    this.formattedDate = this.getInitDate();
    this.modelChangeSub = this.model.valueChanges.subscribe(() => {
      const newDate = this.getInitDate();
      if (hasValue(newDate) && newDate !== this.formattedDate && !this.isOnFocus) {
        this.formattedDate = newDate;
      }
    });
  }

  ngOnDestroy() {
    if (hasValue(this.modelChangeSub)) {
      this.modelChangeSub.unsubscribe();
    }
  }

  getInitDate(): string {
    return this.model.value instanceof FormFieldMetadataValueObject ? this.model.value.value : this.formatter.format(this.model.value as NgbDateStruct);
  }

  onBlur(event) {
    this.isOnFocus = false;
    const newDate = this.getInitDate();
    if (!hasValue(this.model.value) || newDate !== this.formattedDate) {
      this.formattedDate = newDate;
      this.blur.emit(event);
    }
  }

  onFocus($event: any) {
    super.onFocus($event);
    this.isOnFocus = true;
  }

}
