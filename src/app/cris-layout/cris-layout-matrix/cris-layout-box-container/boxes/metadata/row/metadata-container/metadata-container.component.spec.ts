import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataContainerComponent } from './metadata-container.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateLoaderMock } from '../../../../../../../shared/mocks/translate-loader.mock';
import { Item } from '../../../../../../../core/shared/item.model';
import { MetadataValue } from '../../../../../../../core/shared/metadata.models';
import { boxMetadata } from '../../../../../../../shared/testing/box.mock';
import { By } from '@angular/platform-browser';
import { FieldRenderingType } from '../../rendering-types/metadata-box.decorator';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { BitstreamDataService } from '../../../../../../../core/data/bitstream-data.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../../../shared/remote-data.utils';
import { createPaginatedList } from '../../../../../../../shared/testing/utils.test';
import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { NestedMetadataGroupEntry } from '../../rendering-types/metadataGroup/metadata-group.component';
import { LoadMoreService } from '../../../../../../services/load-more.service';

describe('MetadataContainerComponent', () => {
  let component: MetadataContainerComponent;
  let fixture: ComponentFixture<MetadataContainerComponent>;

  const metadataValue = Object.assign(new MetadataValue(), {
    'value': 'test item title',
    'language': null,
    'authority': null,
    'confidence': -1,
    'place': 0
  });

  const testItem = Object.assign(new Item(),
    {
      type: 'item',
      metadata: {
        'dc.title': [metadataValue],
        'dc.contributor.author': [
          {
            value: 'Donohue, Tim'
          },
          {
            value: 'Surname, Name'
          }
        ],
        'oairecerif.author.affiliation': [
          {
            value: 'Duraspace'
          },
          {
            value: '4Science'
          }
        ]
      },
      uuid: 'test-item-uuid',
    }
  );

  const testItem2 =  Object.assign(new Item(),
  {
    type: 'item',
    metadata: {
      'dc.title': [metadataValue, metadataValue, metadataValue, metadataValue, metadataValue, metadataValue],
      'dc.contributor.author': [
        {
          value: 'Donohue, Tim'
        },
        {
          value: 'Surname, Name'
        }
      ],
      'oairecerif.author.affiliation': [
        {
          value: 'Duraspace'
        },
        {
          value: '4Science'
        }
      ]
    },
    uuid: 'test-item-uuid',
  }
);

  const fieldMock = {
    metadata: 'dc.title',
    label: 'Preferred name',
    rendering: null,
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldMock1 = {
    metadata: 'dc.title',
    label: 'Preferred name',
    rendering: 'text.more1.last2',
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldMock2 = {
    metadata: 'dc.title',
    label: 'Preferred name',
    rendering: 'text',
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldMockWithoutLabel = {
    metadata: 'dc.title',
    label: null,
    rendering: null,
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldMockWithoutMetadata = {
    metadata: 'dc.identifier',
    label: 'Preferred name',
    rendering: null,
    fieldType: 'METADATA',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    labelAsHeading: false,
    valuesInline: true
  };

  const fieldStructuredMock = Object.assign({
    id: 1,
    metadata: 'dc.contributor.author',
    fieldType: 'METADATAGROUP',
    label: 'Author(s)',
    rendering: FieldRenderingType.TABLE,
    style: 'container row',
    styleLabel: 'test-group-style-label',
    styleValue: 'test-group-style-value',
    metadataGroup: {
      leading: 'dc.contributor.author',
      elements: [
        {
          metadata: 'dc.contributor.author',
          label: 'Author(s)',
          rendering: 'TEXT',
          fieldType: 'METADATA',
          style: null,
          styleLabel: 'test-style-label',
          styleValue: 'test-style-value',
        },
        {
          metadata: 'oairecerif.author.affiliation',
          label: 'Affiliation(s)',
          rendering: 'TEXT',
          fieldType: 'METADATA',
          style: null,
          styleLabel: 'font-weight-bold col-0',
          styleValue: 'col'
        }
      ]
    }
  }) as LayoutField;

  const bitstreamField = Object.assign({
    id: 1,
    label: 'Field Label',
    metadata: 'dc.identifier.doi',
    rendering: FieldRenderingType.ATTACHMENT,
    fieldType: 'BITSTREAM',
    style: null,
    styleLabel: 'test-style-label',
    styleValue: 'test-style-value',
    bitstream: {
      bundle: 'ORIGINAL',
      metadataField: 'dc.type',
      metadataValue: 'thumbnail'
    }
  });

  const mockEntry = [
    {
      'field':{
          'metadata':'dc.identifier.doi',
          'label':'DOI',
          'rendering':null,
          'fieldType':'METADATA',
          'styleLabel':'font-weight-bold col-3',
          'styleValue':null,
          'labelAsHeading':false,
          'valuesInline':false
      },
      'value':{
          'uuid':'e0f17692-576f-4b2f-a5d5-17c461704b29',
          'language':null,
          'value':'10.1016/j.procs.2017.03.038',
          'place':0,
          'authority':null,
          'confidence':-1
      }
    },
    {
      'field':{
          'metadata':'dc.identifier.doi',
          'label':'DOI',
          'rendering':null,
          'fieldType':'METADATA',
          'styleLabel':'font-weight-bold col-3',
          'styleValue':null,
          'labelAsHeading':false,
          'valuesInline':false
      },
      'value':{
          'uuid':'36169931-7195-41c6-89b4-d6dc7b75ef69',
          'language':null,
          'value':'sas',
          'place':1,
          'authority':null,
          'confidence':-1
      }
    },
    {
      'field':{
          'metadata':'dc.identifier.doi',
          'label':'DOI',
          'rendering':null,
          'fieldType':'METADATA',
          'styleLabel':'font-weight-bold col-3',
          'styleValue':null,
          'labelAsHeading':false,
          'valuesInline':false
      },
      'value':{
          'uuid':'2a7a6a10-0600-4340-b128-eda4e08f852c',
          'language':null,
          'value':'sa67',
          'place':2,
          'authority':null,
          'confidence':-1
      }
    },
    {
      'field':{
          'metadata':'dc.identifier.doi',
          'label':'DOI',
          'rendering':null,
          'fieldType':'METADATA',
          'styleLabel':'font-weight-bold col-3',
          'styleValue':null,
          'labelAsHeading':false,
          'valuesInline':false
      },
      'value':{
          'uuid':'7a75bb92-9af6-4e90-85a4-1d69b2941b1d',
          'language':null,
          'value':'76',
          'place':3,
          'authority':null,
          'confidence':-1
      }
    },
    {
      'field':{
          'metadata':'dc.identifier.doi',
          'label':'DOI',
          'rendering':null,
          'fieldType':'METADATA',
          'styleLabel':'font-weight-bold col-3',
          'styleValue':null,
          'labelAsHeading':false,
          'valuesInline':false
      },
      'value':{
          'uuid':'74ca8dcb-594b-4f57-b54f-942ffeb18466',
          'language':null,
          'value':'899',
          'place':4,
          'authority':null,
          'confidence':-1
      }
    },
    {
      'field':{
          'metadata':'dc.identifier.doi',
          'label':'DOI',
          'rendering':null,
          'fieldType':'METADATA',
          'styleLabel':'font-weight-bold col-3',
          'styleValue':null,
          'labelAsHeading':false,
          'valuesInline':false
      },
      'value':{
          'uuid':'1d032b00-5e59-4352-9471-60ccc077142b',
          'language':null,
          'value':'Testing',
          'place':5,
          'authority':null,
          'confidence':-1
      }
    }
] as NestedMetadataGroupEntry[];

  const bitstream1 = Object.assign(new Bitstream(), {
    id: 'bitstream1',
    uuid: 'bitstream1'
  });

  const mockBitstreamDataService = jasmine.createSpyObj('BitstreamDataService', {
    findShowableBitstreamsByItem: jasmine.createSpy('findShowableBitstreamsByItem')
  });

  const mockLoadMoreService = jasmine.createSpyObj('LoadMoreService',{
    getComputedData: jasmine.createSpy('getComputedData'),
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      providers: [
        { provide: BitstreamDataService, useValue: mockBitstreamDataService },
        { provide: LoadMoreService, useValue: mockLoadMoreService },
      ],
      declarations: [MetadataContainerComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataContainerComponent);
    component = fixture.componentInstance;
    component.item = testItem;
    component.box = boxMetadata;

    mockBitstreamDataService.findShowableBitstreamsByItem.and.returnValue(
      createSuccessfulRemoteDataObject$(createPaginatedList([]))
    );
  });

  describe('When field rendering type is not structured', () => {

    beforeEach(() => {
      component.field = fieldMock;
      fixture.detectChanges();
    });
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render metadata properly', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
      expect(spanValueFound.length).toBe(1);

      const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
      expect(valueFound.length).toBe(1);
      done();
    });
  });

  describe('When field rendering type is structured', () => {

    beforeEach(() => {
      component.field = fieldStructuredMock;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render metadata properly', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-group-style-label'));
      expect(spanValueFound.length).toBe(1);

      const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
      expect(valueFound.length).toBe(1);
      done();
    });
  });

  describe('When field has no label', () => {

    beforeEach(() => {
      component.field = fieldMockWithoutLabel;
      fixture.detectChanges();
    });
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render metadata properly', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
      expect(spanValueFound.length).toBe(0);

      const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
      expect(valueFound.length).toBe(1);
      done();
    });
  });

  describe('When item has not the field metadata', () => {

    beforeEach(() => {
      component.field = fieldMockWithoutMetadata;
      fixture.detectChanges();
    });
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render metadata properly', (done) => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
      expect(spanValueFound.length).toBe(0);

      const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
      expect(valueFound.length).toBe(0);
      done();
    });
  });

  describe('When field type is bitstream', () => {
    beforeEach(() => {
      component.field = bitstreamField;
    });

    describe('and item has no bitstream', () => {

      beforeEach(() => {
        fixture.detectChanges();
      });
      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should not render metadata ', (done) => {
        const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
        expect(spanValueFound.length).toBe(0);

        const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
        expect(valueFound.length).toBe(0);
        done();
      });
    });

    describe('and item has bitstream', () => {

      beforeEach(() => {
        mockBitstreamDataService.findShowableBitstreamsByItem.and.returnValue(createSuccessfulRemoteDataObject$(createPaginatedList([bitstream1])));
        fixture.detectChanges();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should render metadata ', (done) => {
        const spanValueFound = fixture.debugElement.queryAll(By.css('.test-style-label'));
        expect(spanValueFound.length).toBe(1);

        const valueFound = fixture.debugElement.queryAll(By.css('ds-metadata-render'));
        expect(valueFound.length).toBe(1);
        done();
      });
    });

    describe('and bitstream has metadata', () => {
      beforeEach(() => {
        component.field.bitstream.metadataField = 'metadataFieldTest';
        component.field.bitstream.metadataValue = 'metadataValueTest';
        fixture.detectChanges();
      });

      it('should use the metadata in filters', () => {
        expect(mockBitstreamDataService.findShowableBitstreamsByItem).toHaveBeenCalledWith(
          testItem.uuid,
          bitstreamField.bitstream.bundle,
          [ { metadataName: 'metadataFieldTest', metadataValue: 'metadataValueTest' } ],
          false
        );
      });
    });

    describe('and bitstream doesnt have metadataValue', () => {
      beforeEach(() => {
        component.field.bitstream.metadataValue = undefined;
        fixture.detectChanges();
      });

      it('should use empty array in filters', () => {
        expect(mockBitstreamDataService.findShowableBitstreamsByItem).toHaveBeenCalledWith(
          testItem.uuid,
          bitstreamField.bitstream.bundle,
          [], // <--- empty array of filters,
          false // <--- filterNonRestricted
        );
      });
    });

  });

  describe('Check LoadMoreService with more tag',() => {
    let loadMoreService: LoadMoreService;
    const firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    const lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    firstLimitedDataToBeRenderedMap.set(0,[mockEntry[0]]);
    lastLimitedDataToBeRenderedMap.set(4,[mockEntry[4]]);
    lastLimitedDataToBeRenderedMap.set(5,[mockEntry[5]]);

    beforeEach(() => {
      loadMoreService =  new LoadMoreService();
      component.field = fieldMock1;
      component.item = testItem2;
      mockLoadMoreService.getComputedData.and.returnValue({
        firstLimitedDataToBeRenderedMap: firstLimitedDataToBeRenderedMap,
        lastLimitedDataToBeRenderedMap: lastLimitedDataToBeRenderedMap,
        isConfigured: true,
        moreLimit: 1,
        lastLimit: 2
      });
      fixture.detectChanges();
    });

    it('should render first data size to be 1 and last data size to be 2', () => {
      expect(component.firstLimitedDataToBeRenderedMap.size).toBe(1);
      expect(component.lastLimitedDataToBeRenderedMap.size).toBe(2);
    });

    it('should display more tag', () => {
      const moreTag = fixture.debugElement.query(By.css('#a-more-label'));
      expect(moreTag).toBeTruthy();
    });
  });

  describe('Check LoadMoreService when no configuration is provided', () => {
    let loadMoreService: LoadMoreService;
    const firstLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();
    const lastLimitedDataToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();

    for (let i = 0; i < mockEntry.length; i++) {
      firstLimitedDataToBeRenderedMap.set(i,[mockEntry[i]]);
    }

    beforeEach(() => {
      loadMoreService =  new LoadMoreService();
      component.field = fieldMock2;
      component.item = testItem2;
      mockLoadMoreService.getComputedData.and.returnValue({
        firstLimitedDataToBeRenderedMap: firstLimitedDataToBeRenderedMap,
        lastLimitedDataToBeRenderedMap: lastLimitedDataToBeRenderedMap,
        isConfigured: false,
        firstLimit: 6,
        lastLimit: 0
      });
      fixture.detectChanges();
    });

    it('should render first data size to be 6 and last data size to be 0', () => {
      expect(component.firstLimitedDataToBeRenderedMap.size).toBe(6);
      expect(component.lastLimitedDataToBeRenderedMap.size).toBe(0);
    });

    it('should not display more tag', () => {
      const moreTag = fixture.debugElement.query(By.css('#a-more-label'));
      expect(moreTag).not.toBeTruthy();
    });
  });
});
