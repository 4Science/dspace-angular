import { FormRowModel } from '../../../../core/config/models/config-submission-form.model';
import { isNotEmpty } from '../../../empty.util';
import { PLACEHOLDER_PARENT_METADATA } from '../ds-dynamic-form-ui/ds-dynamic-form-constants';
import {
  DynamicRelationGroupModel,
  DynamicRelationGroupModelConfig,
} from '../ds-dynamic-form-ui/models/relation-group/dynamic-relation-group.model';
import { FormFieldModel } from '../models/form-field.model';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { FieldParser } from './field-parser';
import { ParserType } from './parser-type';

export class RelationGroupFieldParser extends FieldParser {

  public modelFactory(fieldValue?: FormFieldMetadataValueObject, label?: boolean) {
    const modelConfiguration: DynamicRelationGroupModelConfig = this.initModel(null, label);

    modelConfiguration.submissionId = this.submissionId;
    modelConfiguration.scopeUUID = this.parserOptions.collectionUUID;
    modelConfiguration.submissionScope = this.parserOptions.submissionScope;
    this.setVocabularyOptions(modelConfiguration, this.parserOptions.collectionUUID);
    if (this.configData && this.configData.rows && this.configData.rows.length > 0) {
      modelConfiguration.formConfiguration = this.configData.rows;
      modelConfiguration.relationFields = [];
      this.configData.rows.forEach((row: FormRowModel) => {
        row.fields.forEach((field: FormFieldModel) => {
          if (field.selectableMetadata[0].metadata === this.configData.selectableMetadata[0].metadata) {
            if (!field.mandatory) {
              // throw new Error(`Configuration not valid: Main field ${this.configData.selectableMetadata[0].metadata} may be mandatory`);
            }
            modelConfiguration.mandatoryField = this.configData.selectableMetadata[0].metadata;
          } else {
            modelConfiguration.relationFields.push(field.selectableMetadata[0].metadata);
          }
        });
      });
    } else {
      throw new Error(`Configuration not valid: ${modelConfiguration.name}`);
    }

    if (isNotEmpty(this.getInitGroupValues())) {
      modelConfiguration.value = [];
      const mandatoryFieldEntries: FormFieldMetadataValueObject[] = this.getInitFieldValues(modelConfiguration.mandatoryField);
      mandatoryFieldEntries.forEach((entry, index) => {
        const item = Object.create(null);
        const listFields = [modelConfiguration.mandatoryField].concat(modelConfiguration.relationFields);
        listFields.forEach((fieldId) => {
          const value = this.getInitFieldValue(0, index, [fieldId]);
          item[fieldId] = isNotEmpty(value) ? value : PLACEHOLDER_PARENT_METADATA;
        });
        modelConfiguration.value.push(item);
      });
    }
    const cls = {
      element: {
        container: 'mb-3',
      },
    };

    this.initSecurityValue(modelConfiguration);
    const model = new DynamicRelationGroupModel(modelConfiguration, cls);
    model.name = this.getFieldId();
    model.isInlineGroup = (this.configData.input.type === ParserType.InlineGroup.toString());

    return model;
  }

}
