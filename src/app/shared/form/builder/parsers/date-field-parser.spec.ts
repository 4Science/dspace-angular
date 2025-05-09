import { getMockTranslateService } from 'src/app/shared/mocks/translate.service.mock';

import { DynamicDsDatePickerModel } from '../ds-dynamic-form-ui/models/date-picker/date-picker.model';
import { FormFieldModel } from '../models/form-field.model';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { DateFieldParser } from './date-field-parser';
import { ParserOptions } from './parser-options';

describe('DateFieldParser test suite', () => {
  let field: FormFieldModel;
  let initFormValues: any = {};
  let translateService = getMockTranslateService();

  const submissionId = '1234';
  const parserOptions: ParserOptions = {
    readOnly: false,
    submissionScope: null,
    collectionUUID: null,
    typeField: 'dc_type',
    isInnerForm: false,
  };

  beforeEach(() => {
    field = {
      input: {
        type: 'date',
      },
      label: 'Date of Issue.',
      mandatory: 'true',
      repeatable: false,
      hints: 'Please give the date of previous publication or public distribution. You can leave out the day and/or month if they aren\'t applicable.',
      mandatoryMessage: 'You must enter at least the year.',
      selectableMetadata: [
        {
          metadata: 'date',
        },
      ],
      languageCodes: [],
    } as FormFieldModel;

  });

  it('should init parser properly', () => {
    const parser = new DateFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    expect(parser instanceof DateFieldParser).toBe(true);
  });

  it('should return a DynamicDsDatePickerModel object when repeatable option is false', () => {
    const parser = new DateFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    const fieldModel = parser.parse();

    expect(fieldModel instanceof DynamicDsDatePickerModel).toBe(true);
  });

  it('should set init value properly', () => {
    initFormValues = {
      date: [new FormFieldMetadataValueObject('1983-11-18')],
    };
    const expectedValue = '1983-11-18';

    const parser = new DateFieldParser(submissionId, field, initFormValues, parserOptions, null, translateService);

    const fieldModel = parser.parse();

    expect(fieldModel.value).toEqual(expectedValue);
  });
});
