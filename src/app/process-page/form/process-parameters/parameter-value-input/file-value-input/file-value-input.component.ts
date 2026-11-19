

import {
  Component,
  Input,
  Optional,
} from '@angular/core';
import {
  ControlContainer,
  FormsModule,
  NgForm,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import {
  hasNoValue,
  isNotEmpty,
} from '../../../../../shared/empty.util';
import { FileValueAccessorDirective } from '../../../../../shared/utils/file-value-accessor.directive';
import { FileValidator } from '../../../../../shared/utils/require-file.validator';
import { controlContainerFactory } from '../../../process-form-factory';
import { ValueInputComponent } from '../value-input.component';

/**
 * Represents the user inputted value of a file parameter
 */
@Component({
  selector: 'ds-file-value-input',
  templateUrl: './file-value-input.component.html',
  styleUrls: ['./file-value-input.component.scss'],
  viewProviders: [{ provide: ControlContainer,
    useFactory: controlContainerFactory,
    deps: [[new Optional(), NgForm]] }],
  imports: [
    FileValidator,
    FileValueAccessorDirective,
    FormsModule,
    TranslateModule,
  ],
})
export class FileValueInputComponent extends ValueInputComponent<File> {
  /**
   * The current value of the file
   */
  fileObject: File;

  /**
   * Initial value of the field.
   * When creating a process from an existing one, this is the name of the file used by the source process:
   * it can't be re-sent, so the validation message asks the user to select the file again.
   */
  @Input() initialValue: any;

  /**
   * Whether the parameter was pre-filled from an existing process and a new file still has to be selected
   */
  get reuploadRequired(): boolean {
    return typeof this.initialValue === 'string' && isNotEmpty(this.initialValue) && hasNoValue(this.fileObject);
  }

  /**
   * Sets the selected file and emits it
   * @param files The selected files
   */
  setFile(files) {
    this.fileObject = files.length > 0 ? files[0] : undefined;
    this.updateValue.emit(this.fileObject);
  }
}
