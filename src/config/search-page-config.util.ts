import { ViewMode } from '../app/core/shared/view-mode.model';
import {
  hasValue,
  isNotEmpty,
} from '../app/shared/empty.util';
import {
  ContextDisplayConfig,
  SearchConfig,
  ViewPaginationConfig,
} from './search-page-config.interface';

/**
 * The resolved pagination preferences for a single search result view mode.
 */
export interface ResolvedViewPagination {
  /**
   * The preferred number of results per page. It is snapped to the nearest active page size option
   * at runtime by {@link PaginationService.getCurrentPagination}.
   */
  pageSize?: number;

  /**
   * The list of selectable page sizes for the view mode.
   */
  pageSizeOptions?: number[];
}

/**
 * The number of columns rendered by the grid view at its maximum display size. The grid page size
 * (and every selectable grid page size option) must be a multiple of this value so that every page
 * fills complete rows.
 */
export const GRID_COLUMN_COUNT = 3;

/**
 * Resolve the preferred initial view mode for a search context.
 *
 * @param config         The {@link ContextDisplayConfig} for the context, if any.
 * @param fallback       The view mode to use when none is configured.
 * @returns              The configured view mode or the fallback.
 */
export function getPreferredViewMode(config: ContextDisplayConfig, fallback: ViewMode = ViewMode.ListElement): ViewMode {
  return config?.preferredView ?? fallback;
}

/**
 * Build the application-wide grid pagination fallback from the global
 * {@link SearchConfig.gridViewDefaultPageSize} and {@link SearchConfig.gridViewPageSizeOptions}.
 *
 * @param searchConfig   The search configuration, if any.
 * @returns              The global grid pagination, or `undefined` when none of the values are set.
 */
export function getGridViewFallback(searchConfig: SearchConfig): ViewPaginationConfig | undefined {
  const pageSize: number | undefined = searchConfig?.gridViewDefaultPageSize;
  const pageSizeOptions: number[] | undefined = searchConfig?.gridViewPageSizeOptions;
  if (hasValue(pageSize) === false && isNotEmpty(pageSizeOptions) === false) {
    return undefined;
  }
  return { pageSize, pageSizeOptions };
}

/**
 * Resolve the preferred pagination for a search context and a specific view mode.
 *
 * Rules:
 * - The detailed view ({@link ViewMode.DetailedListElement}) does not support pagination: `undefined`
 *   is always returned so the caller falls back to its own default pagination.
 * - The list view ({@link ViewMode.ListElement}) uses the context `list` block only.
 * - The grid view ({@link ViewMode.GridElement}) resolves, field by field, the context `grid` block
 *   first and then the global grid fallback ({@link getGridViewFallback}). Both sources must only use
 *   multiples of {@link GRID_COLUMN_COUNT}: an invalid source is ignored as a whole (a warning is
 *   logged) and resolution continues with the next one.
 * - The resolved values are passed through as-is; the pagination layer
 *   ({@link PaginationService.getCurrentPagination}) snaps the resolved `pageSize` to the nearest
 *   active page size option at runtime, so no snapping is performed here.
 *
 * @param config         The {@link ContextDisplayConfig} for the context, if any.
 * @param viewMode       The view mode for which the pagination is resolved.
 * @param gridFallback   The global grid pagination fallback, if any (see {@link getGridViewFallback}).
 * @returns              The resolved pagination, or `undefined` when none applies.
 */
export function getPreferredPagination(
  config: ContextDisplayConfig,
  viewMode: ViewMode,
  gridFallback?: ViewPaginationConfig,
): ResolvedViewPagination | undefined {
  switch (viewMode) {
    case ViewMode.ListElement:
      return toResolvedPagination(config?.listPaginationConfig);
    case ViewMode.GridElement:
      return toResolvedPagination(mergeViewPagination(
        getValidGridPagination(config?.gridPaginationConfig, 'context'),
        getValidGridPagination(gridFallback, 'global'),
      ));
    default:
      return undefined;
  }
}

/**
 * Return the given grid pagination when it only uses multiples of {@link GRID_COLUMN_COUNT},
 * otherwise log a warning and return `undefined`.
 */
function getValidGridPagination(viewConfig: ViewPaginationConfig, source: 'context' | 'global'): ViewPaginationConfig | undefined {
  if (hasValue(viewConfig) === false) {
    return undefined;
  }
  if (!isValidGridPagination(viewConfig)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Invalid ${source} grid pagination configuration: pageSize and every pageSizeOptions entry must be a ` +
      `multiple of ${GRID_COLUMN_COUNT}. ${source === 'context' ? 'Falling back to the global grid pagination.' : 'Ignoring it.'}`,
      viewConfig,
    );
    return undefined;
  }
  return viewConfig;
}

/**
 * Merge two pagination configurations field by field, the primary taking precedence.
 */
function mergeViewPagination(primary: ViewPaginationConfig, fallback: ViewPaginationConfig): ViewPaginationConfig | undefined {
  if (hasValue(primary) === false) {
    return fallback;
  }
  if (hasValue(fallback) === false) {
    return primary;
  }
  return {
    pageSize: hasValue(primary.pageSize) ? primary.pageSize : fallback.pageSize,
    pageSizeOptions: isNotEmpty(primary.pageSizeOptions) ? primary.pageSizeOptions : fallback.pageSizeOptions,
  };
}

/**
 * Convert a {@link ViewPaginationConfig} into a {@link ResolvedViewPagination}, returning `undefined`
 * when it defines neither a page size nor page size options.
 */
function toResolvedPagination(viewConfig: ViewPaginationConfig): ResolvedViewPagination | undefined {
  const pageSizeOptions: number[] | undefined = isNotEmpty(viewConfig?.pageSizeOptions) ? [...viewConfig.pageSizeOptions] : undefined;
  const pageSize: number | undefined = hasValue(viewConfig?.pageSize) ? viewConfig.pageSize : undefined;
  if (hasValue(pageSize) === false && hasValue(pageSizeOptions) === false) {
    return undefined;
  }
  return { pageSize, pageSizeOptions };
}

/**
 * Validate that a grid {@link ViewPaginationConfig} only uses multiples of {@link GRID_COLUMN_COUNT}.
 */
function isValidGridPagination(viewConfig: ViewPaginationConfig): boolean {
  if (hasValue(viewConfig.pageSize) && !isMultipleOfGridColumns(viewConfig.pageSize)) {
    return false;
  }
  if (isNotEmpty(viewConfig.pageSizeOptions) && viewConfig.pageSizeOptions.some((size: number) => !isMultipleOfGridColumns(size))) {
    return false;
  }
  return true;
}

/**
 * Whether the given value is a strictly positive multiple of {@link GRID_COLUMN_COUNT}.
 */
function isMultipleOfGridColumns(value: number): boolean {
  return Number.isInteger(value) && value > 0 && value % GRID_COLUMN_COUNT === 0;
}
