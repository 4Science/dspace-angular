import { DynamicFormControlLayout, serializable } from '@ng-dynamic-forms/core';
import { DsDynamicInputModel, DsDynamicInputModelConfig } from '../ds-dynamic-input.model';
import { DYNAMIC_FORM_CONTROL_TYPE_MARKDOWN } from './dynamic-markdown.model';


export class DsDynamicMarkdownModel extends DsDynamicInputModel {
  @serializable() type = DYNAMIC_FORM_CONTROL_TYPE_MARKDOWN;

  constructor(config: DsDynamicInputModelConfig, layout?: DynamicFormControlLayout) {
    super(config, layout);

  }

}
