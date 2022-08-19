import { TestBed } from '@angular/core/testing';
import { NestedMetadataGroupEntry } from '../cris-layout-matrix/cris-layout-box-container/boxes/metadata/rendering-types/metadataGroup/metadata-group.component';
import { LoadMoreService } from './load-more.service';

interface ComputedData {
    firstLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
    lastLimitedDataToBeRenderedMap: Map<number, NestedMetadataGroupEntry[]>;
    isConfigured: boolean;
    firstLimit: number;
    lastLimit: number;
  }

describe('LoadMoreService', () => {
  let service: LoadMoreService;
  const entry = [
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

  const componentsToBeRenderedMap = new Map<number, NestedMetadataGroupEntry[]>();

  for (let index = 0; index < entry.length; index++) {
      componentsToBeRenderedMap.set(index,[entry[index]]);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [LoadMoreService]
    });
    service = TestBed.inject(LoadMoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return data first data with size 2 last data with size 1', () => {
    let data: ComputedData;
    const renderConfig = 'inline.first2.last1';
    data = service.getComputedData(componentsToBeRenderedMap,renderConfig);
    expect(data.firstLimitedDataToBeRenderedMap.size).toBe(2);
    expect(data.lastLimitedDataToBeRenderedMap.size).toBe(1);
  });

  it('should return data first data with size 3 last data with size 2', () => {
    let data: ComputedData;
    const renderConfig = 'inline.first3.last2';
    data = service.getComputedData(componentsToBeRenderedMap,renderConfig);
    expect(data.firstLimitedDataToBeRenderedMap.size).toBe(3);
    expect(data.lastLimitedDataToBeRenderedMap.size).toBe(2);
  });

  it('should return data first data with size 3 last data with size 0', () => {
    let data: ComputedData;
    const renderConfig = 'inline.first3';
    data = service.getComputedData(componentsToBeRenderedMap,renderConfig);
    expect(data.firstLimitedDataToBeRenderedMap.size).toBe(3);
    expect(data.lastLimitedDataToBeRenderedMap.size).toBe(0);
  });

  it('should ignore "last" if "first" is missing', () => {
    let data: ComputedData;
    const renderConfig = 'inline.last3';
    data = service.getComputedData(componentsToBeRenderedMap,renderConfig);
    expect(data.firstLimitedDataToBeRenderedMap.size).toBe(6);
    expect(data.lastLimitedDataToBeRenderedMap.size).toBe(0);
  });

  it('should use default values', () => {
    let data: ComputedData;
    const renderConfig = 'inline.first.last';
    data = service.getComputedData(componentsToBeRenderedMap,renderConfig);
    expect(data.firstLimitedDataToBeRenderedMap.size).toBe(3);
    expect(data.lastLimitedDataToBeRenderedMap.size).toBe(1);
  });

  it('should use default values', () => {
    let data: ComputedData;
    const renderConfig = 'inline.last';
    data = service.getComputedData(componentsToBeRenderedMap,renderConfig);
    expect(data.firstLimitedDataToBeRenderedMap.size).toBe(6);
    expect(data.lastLimitedDataToBeRenderedMap.size).toBe(0);
  });

  it('should return data first data with size 6 last data with size 0', () => {
    let data: ComputedData;
    const renderConfig = 'inline';
    data = service.getComputedData(componentsToBeRenderedMap,renderConfig);
    expect(data.firstLimitedDataToBeRenderedMap.size).toBe(6);
    expect(data.lastLimitedDataToBeRenderedMap.size).toBe(0);
  });
});
