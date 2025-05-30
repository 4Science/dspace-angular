import { Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FormFieldModel } from '../models/form-field.model';
import { ConcatFieldParser } from './concat-field-parser';
import {
  CONFIG_DATA,
  INIT_FORM_VALUES,
  PARSER_OPTIONS,
  SECURITY_CONFIG,
  SUBMISSION_ID,
} from './field-parser';
import { ParserOptions } from './parser-options';

export class NameFieldParser extends ConcatFieldParser {

  constructor(
    @Inject(SUBMISSION_ID) submissionId: string,
    @Inject(CONFIG_DATA) configData: FormFieldModel,
    @Inject(INIT_FORM_VALUES) initFormValues,
    @Inject(PARSER_OPTIONS) parserOptions: ParserOptions,
    @Inject(SECURITY_CONFIG) securityConfig: any = null,
    translate: TranslateService,
  ) {
    super(submissionId, configData, initFormValues, parserOptions, securityConfig, translate, ',', 'form.last-name', 'form.first-name');
  }
}
