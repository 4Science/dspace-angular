import { getMockTranslateService } from 'src/app/shared/mocks/translate.service.mock';

import { FormFieldModel } from '../../../../core/shared/form/form-field.model';
import { DynamicConcatModel } from '../ds-dynamic-form-ui/models/ds-dynamic-concat.model';
import { FormFieldMetadataValueObject } from '../models/form-field-metadata-value.model';
import { ParserOptions } from './parser-options';
import { SeriesFieldParser } from './series-field-parser';

describe('SeriesFieldParser test suite', () => {
  let field: FormFieldModel;
  let initFormValues: any = {};
  let translateService = getMockTranslateService();

  const submissionId = '1234';
  const parserOptions: ParserOptions = {
    readOnly: false,
    submissionScope: 'testScopeUUID',
    collectionUUID: null,
    typeField: 'dc_type',
  };

  beforeEach(() => {
    field = {
      input: { type: 'series' },
      label: 'Series/Report No.',
      mandatory: 'false',
      repeatable: false,
      hints: 'Enter the series and number assigned to this item by your community.',
      selectableMetadata: [
        {
          metadata: 'series',
        },
      ],
      languageCodes: [],
    } as FormFieldModel;

  });

  it('should init parser properly', () => {
    const parser = new SeriesFieldParser(submissionId, field, initFormValues, parserOptions, translateService);

    expect(parser instanceof SeriesFieldParser).toBe(true);
  });

  it('should return a DynamicConcatModel object when repeatable option is false', () => {
    const parser = new SeriesFieldParser(submissionId, field, initFormValues, parserOptions, translateService);

    const fieldModel = parser.parse();

    expect(fieldModel instanceof DynamicConcatModel).toBe(true);
  });

  it('should return a DynamicConcatModel object with the correct separator', () => {
    const parser = new SeriesFieldParser(submissionId, field, initFormValues, parserOptions, translateService);

    const fieldModel = parser.parse();

    expect((fieldModel as DynamicConcatModel).separator).toBe('; ');
  });

  it('should set init value properly', () => {
    initFormValues = {
      series: [new FormFieldMetadataValueObject('test; series')],
    };
    const expectedValue = new FormFieldMetadataValueObject('test; series', undefined, undefined, 'test');

    const parser = new SeriesFieldParser(submissionId, field, initFormValues, parserOptions, translateService);

    const fieldModel = parser.parse();

    expect(fieldModel.value).toEqual(expectedValue);
  });

});
