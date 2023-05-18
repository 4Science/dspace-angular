import { FilterType } from '../../models/filter-type.model';
import { hasNoValue, isEmpty } from '../../../empty.util';
import { BuildConfig } from '../../../../../config/build-config.interface';

/**
 * Contains the mapping between a facet component and a FilterType
 */
const filterTypeMap = new Map();

/**
 * Contains the mapping between an {@link BuildConfig} path and a {@link FilterType}
 */
const filterTypeEnvironmentMap = new Map();

/**
 * Sets the mapping for a facet component in relation to a filter type
 * @param {FilterType} type The type for which the matching component is mapped
 * @returns Decorator function that performs the actual mapping on initialization of the facet component
 */
export function renderFacetFor(type: FilterType) {
  return function decorator(objectElement: any) {
    if (!objectElement) {
      return;
    }
    filterTypeMap.set(type, objectElement);
  };
}

/**
 * Sets the mapping for a facet component in relation to a filter type and an environment array property.
 *
 * @param {FilterType} type The type for which the matching component is mapped
 * @param {string[]} environment property of the {@link BuildConfig} that will be matched
 * @returns Decorator function that performs the actual mapping on initialization of the facet component
 */
export function renderFacetForEnvironment(type: FilterType, environment?: string) {
  return function decorator(objectElement: any) {
    if (!objectElement) {
      return;
    }
    let renderTypesConfig: { environment?: string, objectElement: any }[] = filterTypeEnvironmentMap.get(type);
    if (hasNoValue(renderTypesConfig)) {
      renderTypesConfig = [];
    }
    if (isEmpty(environment)) {
      renderTypesConfig =
        renderTypesConfig.concat(
          Object.assign({}, { objectElement })
        );
    } else {
      renderTypesConfig =
        renderTypesConfig.concat(
          Object.assign({}, { environment, objectElement })
        );
    }
    filterTypeEnvironmentMap.set(type, renderTypesConfig);
  };
}

/**
 * Requests the matching facet component based on a given filter type
 * @param {FilterType} type The filter type for which the facet component is requested
 * @returns The facet component's constructor that matches the given filter type
 */
export function renderFilterType(type: FilterType) {
  return filterTypeMap.get(type);
}

/**
 * Finds the facet for the given {@param type} mapped value in {@link filterTypeEnvironmentMap} by evaluating it as
 * an array props of {@param environment} and chooses the one that matches the {@param filterConfigName}.
 *
 * @param type {FilterType} of the mapped facet
 * @param environment {BuildConfig} configuration of the current build
 * @param filterConfigName simple name of the facet that needs to be matched in a target config path
 */
export function renderFilterTypeEnvironment(type: FilterType, environment: Partial<BuildConfig>, filterConfigName: string) {
  let renderTypeFound = filterTypeEnvironmentMap.get(type).find(typeConfig => hasNoValue(typeConfig.environment));
  let renderTypeConfigs = filterTypeEnvironmentMap.get(type) as { environment?: string, objectElement: any }[];
  renderTypeConfigs
    .some(renderConfig => {
      if (hasNoValue(renderConfig.environment)) {
        return false;
      }
      const environmentValue =
        renderConfig.environment
          .split('.')
          .reduce((a, b) => a[b], environment) as string[];
      return environmentValue != null &&
        (environmentValue.some(confName => filterConfigName === confName && (renderTypeFound = renderConfig)));
    });
  return renderTypeFound.objectElement;
}
