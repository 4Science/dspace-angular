import {
  DynamicFormControlLayout,
  DynamicRadioGroupModel,
  DynamicRadioGroupModelConfig,
  serializable
} from '@ng-dynamic-forms/core';
import { VocabularyOptions } from '../../../../../../core/submission/vocabularies/models/vocabulary-options.model';
import { hasValue } from '../../../../../empty.util';

export interface DynamicListModelConfig extends DynamicRadioGroupModelConfig<any> {
  vocabularyOptions: VocabularyOptions;
  groupLength?: number;
  repeatable: boolean;
  value?: any;
  openType?: boolean;
}

export class DynamicListRadioGroupModel extends DynamicRadioGroupModel<any> {

  @serializable() vocabularyOptions: VocabularyOptions;
  @serializable() repeatable: boolean;
  @serializable() groupLength: number;
  @serializable() openType: boolean;
  isListGroup = true;

  constructor(config: DynamicListModelConfig, layout?: DynamicFormControlLayout) {
    super(config, layout);

    this.vocabularyOptions = config.vocabularyOptions;
    this.groupLength = config.groupLength || 5;
    this.repeatable = config.repeatable;
    this.value = config.value;
    this.openType = config.openType;
  }

  get hasAuthority(): boolean {
    return this.vocabularyOptions && hasValue(this.vocabularyOptions.name);
  }
}
