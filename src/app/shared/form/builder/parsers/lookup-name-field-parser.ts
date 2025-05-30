import {
  DynamicLookupNameModel,
  DynamicLookupNameModelConfig,
} from '../ds-dynamic-form-ui/models/lookup/dynamic-lookup-name.model';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { FieldParser } from './field-parser';

export class LookupNameFieldParser extends FieldParser {

  public modelFactory(fieldValue?: FormFieldMetadataValueObject, label?: boolean): any {
    if (this.configData.selectableMetadata[0].controlledVocabulary) {
      const lookupModelConfig: DynamicLookupNameModelConfig = this.initModel(null, label);

      this.setVocabularyOptions(lookupModelConfig, this.parserOptions.collectionUUID);

      this.setValues(lookupModelConfig, fieldValue, true);

      lookupModelConfig.submissionScope = this.parserOptions.submissionScope;

      return new DynamicLookupNameModel(lookupModelConfig);
    }
  }

}
