import differenceWith from 'lodash/differenceWith';
import groupBy from 'lodash/groupBy';
import isObject from 'lodash/isObject';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import { validate as uuidValidate } from 'uuid';

import {
  hasValue,
  isEmpty,
  isNotEmpty,
  isNotUndefined,
  isUndefined,
} from '../../shared/empty.util';
import {
  MetadataMapInterface,
  MetadataValue,
  MetadataValueFilter,
  MetadatumViewModel,
} from './metadata.models';

export const AUTHORITY_GENERATE = 'will be generated::';
export const AUTHORITY_REFERENCE = 'will be referenced::';
export const PLACEHOLDER_VALUE = '#PLACEHOLDER_PARENT_METADATA_VALUE#';
/**
 * Utility class for working with DSpace object metadata.
 *
 * When specifying metadata keys, wildcards are supported, so `'*'` will match all keys, `'dc.date.*'` will
 * match all qualified dc dates, and so on. Exact keys will be evaluated (and matches returned) in the order
 * they are given.
 *
 * When multiple keys in a map match a given wildcard, they are evaluated in the order they are stored in
 * the map (alphanumeric if obtained from the REST api). If duplicate or overlapping keys are specified, the
 * first one takes precedence. For example, specifying `['dc.date', 'dc.*', '*']` will cause any `dc.date`
 * values to be evaluated (and returned, if matched) first, followed by any other `dc` metadata values,
 * followed by any other (non-dc) metadata values.
 */
export class Metadata {

  /**
   * Gets all matching metadata in the map(s).
   *
   * @param {MetadataMapInterface|MetadataMapInterface[]} mapOrMaps The source map(s). When multiple maps are given, they will be
   * checked in order, and only values from the first with at least one match will be returned.
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see above.
   * @param {MetadataValueFilter} filter The value filter to use. If unspecified, no filtering will be done.
   * @param {number} limit The maximum number of values to return. If unspecified, all matching values will be returned.
   * @returns {MetadataValue[]} the matching values or an empty array.
   */
  public static all(
    mapOrMaps: MetadataMapInterface | MetadataMapInterface[],
    keyOrKeys: string | string[],
    filter?: MetadataValueFilter,
    limit?: number): MetadataValue[] {
    const mdMaps: MetadataMapInterface[] = mapOrMaps instanceof Array ? mapOrMaps : [mapOrMaps];
    const matches: MetadataValue[] = [];
    for (const mdMap of mdMaps) {
      for (const mdKey of Metadata.resolveKeys(mdMap, keyOrKeys)) {
        const candidates = mdMap[mdKey];
        if (candidates) {
          for (const candidate of candidates) {
            if (Metadata.valueMatches(candidate as MetadataValue, filter)) {
              matches.push(candidate as MetadataValue);
              if (hasValue(limit) && matches.length >= limit) {
                return  matches;
              }
            }
          }
        }
      }
      if (!isEmpty(matches)) {
        return matches;
      }
    }
    return matches;
  }

  /**
   * Like [[Metadata.all]], but only returns string values.
   *
   * @param {MetadataMapInterface|MetadataMapInterface[]} mapOrMaps The source map(s). When multiple maps are given, they will be
   * checked in order, and only values from the first with at least one match will be returned.
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see above.
   * @param {MetadataValueFilter} filter The value filter to use. If unspecified, no filtering will be done.
   * @returns {string[]} the matching string values or an empty array.
   */
  public static allValues(mapOrMaps: MetadataMapInterface | MetadataMapInterface[], keyOrKeys: string | string[],
    filter?: MetadataValueFilter): string[] {
    return Metadata.all(mapOrMaps, keyOrKeys, filter).map((mdValue) => mdValue.value);
  }

  /**
   * Gets the first matching MetadataValue object in the map(s), or `undefined`.
   *
   * @param {MetadataMapInterface|MetadataMapInterface[]} mapOrMaps The source map(s).
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see above.
   * @param {MetadataValueFilter} filter The value filter to use. If unspecified, no filtering will be done.
   * @returns {MetadataValue} the first matching value, or `undefined`.
   */
  public static first(mdMapOrMaps: MetadataMapInterface | MetadataMapInterface[], keyOrKeys: string | string[],
    filter?: MetadataValueFilter): MetadataValue {
    const mdMaps: MetadataMapInterface[] = mdMapOrMaps instanceof Array ? mdMapOrMaps : [mdMapOrMaps];
    for (const mdMap of mdMaps) {
      for (const key of Metadata.resolveKeys(mdMap, keyOrKeys)) {
        const values: MetadataValue[] = mdMap[key] as MetadataValue[];
        if (values) {
          return values.find((value: MetadataValue) => Metadata.valueMatches(value, filter));
        }
      }
    }
  }

  /**
   * Like [[Metadata.first]], but only returns a string value, or `undefined`.
   *
   * @param {MetadataMapInterface|MetadataMapInterface[]} mapOrMaps The source map(s).
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see above.
   * @param {MetadataValueFilter} filter The value filter to use. If unspecified, no filtering will be done.
   * @returns {string} the first matching string value, or `undefined`.
   */
  public static firstValue(mdMapOrMaps: MetadataMapInterface | MetadataMapInterface[], keyOrKeys: string | string[],
    filter?: MetadataValueFilter): string {
    const value = Metadata.first(mdMapOrMaps, keyOrKeys, filter);
    return isUndefined(value) ? undefined : value.value;
  }

  /**
   * Checks for a matching metadata value in the given map(s).
   *
   * @param {MetadataMapInterface|MetadataMapInterface[]} mapOrMaps The source map(s).
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see above.
   * @param {MetadataValueFilter} filter The value filter to use. If unspecified, no filtering will be done.
   * @returns {boolean} whether a match is found.
   */
  public static has(mdMapOrMaps: MetadataMapInterface | MetadataMapInterface[], keyOrKeys: string | string[],
    filter?: MetadataValueFilter): boolean {
    return isNotUndefined(Metadata.first(mdMapOrMaps, keyOrKeys, filter));
  }

  /**
   * Returns true if this Metadatum's authority key contains a reference
   */
  public static hasAuthorityReference(authority: string): boolean {
    return hasValue(authority) && (typeof authority === 'string' && (authority.startsWith(AUTHORITY_GENERATE) || authority.startsWith(AUTHORITY_REFERENCE)));
  }

  /**
   * Returns true if this Metadatum's authority key is a valid
   */
  public static hasValidAuthority(authority: string): boolean {
    return hasValue(authority) && !Metadata.hasAuthorityReference(authority);
  }

  /**
   * Returns true if this Metadatum's authority key is a valid UUID
   */
  public static hasValidItemAuthority(authority: string): boolean {
    return hasValue(authority) && uuidValidate(authority);
  }

  /**
   * Returns true if this Metadatum's value is defined
   */
  public static hasValue(value: MetadataValue|string): boolean {
    if (isEmpty(value)) {
      return false;
    }
    if (isObject(value) && value.hasOwnProperty('value')) {
      return isNotEmpty(value.value);
    }
    return true;
  }

  /**
   * Checks if a value matches a filter.
   *
   * @param {MetadataValue} mdValue the value to check.
   * @param {MetadataValueFilter} filter the filter to use.
   * @returns {boolean} whether the filter matches, or true if no filter is given.
   */
  public static valueMatches(mdValue: MetadataValue, filter: MetadataValueFilter) {
    if (!filter) {
      return true;
    } else if (filter.language && filter.language !== mdValue.language) {
      return false;
    } else if (filter.authority && filter.authority !== mdValue.authority) {
      return false;
    } else if (filter.value) {
      let fValue = filter.value;
      let mValue = mdValue.value;

      if (filter.ignoreCase) {
        fValue = filter.value.toLowerCase();
        mValue = mdValue.value.toLowerCase();
      }
      let result;

      if (filter.substring) {
        result = mValue.includes(fValue);
      } else {
        result = mValue === fValue;
      }
      return filter.negate ? !result : result;
    }
    return true;
  }

  /**
   * Gets the list of keys in the map limited by, and in the order given by `keyOrKeys`.
   *
   * @param {MetadataMapInterface} mdMap The source map.
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see above.
   */
  private static resolveKeys(mdMap: MetadataMapInterface = {}, keyOrKeys: string | string[]): string[] {
    const inputKeys: string[] = keyOrKeys instanceof Array ? keyOrKeys : [keyOrKeys];
    const outputKeys: string[] = [];
    for (const inputKey of inputKeys) {
      if (inputKey.includes('*')) {
        const inputKeyRegex = new RegExp('^' + inputKey.replace(/\\/g, '\\\\').replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        for (const mapKey of Object.keys(mdMap)) {
          if (!outputKeys.includes(mapKey) && inputKeyRegex.test(mapKey)) {
            outputKeys.push(mapKey);
          }
        }
      } else if (mdMap.hasOwnProperty(inputKey) && !outputKeys.includes(inputKey)) {
        outputKeys.push(inputKey);
      }
    }
    return outputKeys;
  }

  /**
   * Creates an array of MetadatumViewModels from an existing MetadataMapInterface.
   *
   * @param {MetadataMapInterface} mdMap The source map.
   * @returns {MetadatumViewModel[]} List of metadata view models based on the source map.
   */
  public static toViewModelList(mdMap: MetadataMapInterface): MetadatumViewModel[] {
    let metadatumList: MetadatumViewModel[] = [];
    Object.keys(mdMap)
      .sort()
      .forEach((key: string) => {
        const fields = mdMap[key].map(
          (metadataValue: MetadataValue, index: number) =>
            Object.assign(
              {},
              metadataValue,
              {
                order: index,
                key,
              }));
        metadatumList = [...metadatumList, ...fields];
      });
    return metadatumList;
  }

  /**
   * Creates an MetadataMapInterface from an existing array of MetadatumViewModels.
   *
   * @param {MetadatumViewModel[]} viewModelList The source list.
   * @returns {MetadataMapInterface} Map with metadata values based on the source list.
   */
  public static toMetadataMap(viewModelList: MetadatumViewModel[]): MetadataMapInterface {
    const metadataMap: MetadataMapInterface = {};
    const groupedList = groupBy(viewModelList, (viewModel) => viewModel.key);
    Object.keys(groupedList)
      .sort()
      .forEach((key: string) => {
        const orderedValues = sortBy(groupedList[key], ['order']);
        metadataMap[key] = orderedValues.map((value: MetadatumViewModel) => {
          const val = Object.assign(new MetadataValue(), value);
          delete (val as any).order;
          delete (val as any).key;
          return val;
        },
        );
      });
    return metadataMap;
  }

  /**
   * Set the first value of a metadata by field key
   * Creates a new MetadataValue if the field doesn't exist yet
   * @param mdMap   The map to add/change values in
   * @param key     The metadata field
   * @param value   The value to add
   */
  public static setFirstValue(mdMap: MetadataMapInterface, key: string, value: string) {
    if (isNotEmpty(mdMap[key])) {
      mdMap[key][0].value = value;
    } else {
      mdMap[key] = [Object.assign(new MetadataValue(), { value: value })];
    }
  }

  /**
     * Check whether the two arrays of metadata are equals (value matching).
     * @param metadata1
     * @param metadata2
     * @private
     */
  public static multiEquals(metadata1: MetadataValue[], metadata2: MetadataValue[]): boolean {
    if (metadata1.length !== metadata2.length) {
      return false;
    }

    // 0. sort array by value
    const sortedMetadata1 = orderBy(metadata1, ['value'],['asc']);
    const sortedMetadata2 = orderBy(metadata2, ['value'],['asc']);
    // 1. check differences
    const differences = differenceWith(sortedMetadata1, sortedMetadata2, Metadata.valueMatches);
    if (differences.length > 0) {
      return false;
    }

    // arrays appear to be equal ...
    return true;
  }
}
