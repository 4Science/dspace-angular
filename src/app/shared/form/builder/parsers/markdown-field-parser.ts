import { FieldParser } from './field-parser';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { environment } from '../../../../../environments/environment';
import { DsDynamicMarkdownModel } from '../ds-dynamic-form-ui/models/markdown/ds-dynamic-markdown.model';
import { DsDynamicInputModelConfig } from '../ds-dynamic-form-ui/models/ds-dynamic-input.model';

export class MarkdownFieldParser extends FieldParser {

  public modelFactory(fieldValue?: FormFieldMetadataValueObject | any, label?: boolean): any {
    const markDownModelConfig: DsDynamicInputModelConfig = this.initModel(null, label);

    markDownModelConfig.spellCheck = environment.form.spellCheck;
    this.setValues(markDownModelConfig, fieldValue);
    return new DsDynamicMarkdownModel(markDownModelConfig);
  }
}
