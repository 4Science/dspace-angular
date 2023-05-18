import {
  DynamicFormControlLayout,
  serializable
} from '@ng-dynamic-forms/core';
import { DsDynamicInputModel, DsDynamicInputModelConfig } from '../ds-dynamic-input.model';

export const DYNAMIC_FORM_CONTROL_TYPE_MARKDOWN = 'MARKDOWN';

/**
 * Model class for displaying a markdown input in a form
 * Functions like a input, but displays a markdown editor instead
 */
export class DynamicMarkdownModel extends DsDynamicInputModel {
  @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_MARKDOWN;

  constructor(config: DsDynamicInputModelConfig, layout?: DynamicFormControlLayout) {
    super(config, layout);
  }
}
