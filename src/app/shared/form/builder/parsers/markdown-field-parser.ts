import { environment } from '../../../../../environments/environment';
import { DsDynamicInputModelConfig } from '../ds-dynamic-form-ui/models/ds-dynamic-input.model';
import { DsDynamicMarkdownModel } from '../ds-dynamic-form-ui/models/markdown/ds-dynamic-markdown.model';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { FieldParser } from './field-parser';

export class MarkdownFieldParser extends FieldParser {

  public modelFactory(fieldValue?: FormFieldMetadataValueObject, label?: boolean): any {
    const markDownModelConfig: DsDynamicInputModelConfig = this.initModel(null, label);

    markDownModelConfig.spellCheck = environment.form.spellCheck;
    this.setValues(markDownModelConfig, fieldValue);
    return new DsDynamicMarkdownModel(markDownModelConfig);
  }
}
