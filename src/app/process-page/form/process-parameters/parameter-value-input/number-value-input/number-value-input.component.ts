import {
  Component,
  Input,
  Optional,
} from '@angular/core';
import {
  ControlContainer,
  NgForm,
} from '@angular/forms';

import { controlContainerFactory } from '../../../process-form.component';
import { ValueInputComponent } from '../value-input.component';

/**
 * Represents the user inputted value of a numeric parameter
 */
@Component({
  selector: 'ds-number-value-input',
  templateUrl: './number-value-input.component.html',
  styleUrls: ['./number-value-input.component.scss'],
  viewProviders: [ { provide: ControlContainer,
    useFactory: controlContainerFactory,
    deps: [[new Optional(), NgForm]] } ],
})
export class NumberValueInputComponent extends ValueInputComponent<string> {
  /**
   * The current value of the string
   */
  value: string;

  /**
   * Initial value of the field
   */
  @Input() initialValue;

  ngOnInit() {
    this.value = this.initialValue;
  }

  setValue(value) {
    this.value = value;
    this.updateValue.emit(value);
  }
}
