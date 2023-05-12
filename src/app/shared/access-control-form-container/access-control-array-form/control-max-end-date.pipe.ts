import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { AccessesConditionOption } from '../../../core/config/models/config-accesses-conditions-options.model';

@Pipe({
  // eslint-disable-next-line @angular-eslint/pipe-prefix
  name: 'maxEndDate',
  pure: false
})
export class ControlMaxEndDatePipe implements PipeTransform {
  transform(control: AbstractControl, dropdownOptions: AccessesConditionOption[]): NgbDateStruct | null {
    const { itemName } = control.value;
    const item = dropdownOptions.find((x) => x.name === itemName);
    if (!item?.hasEndDate) {
      return null;
    }
    const date = new Date(item.maxEndDate);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    } as NgbDateStruct;
  }

}