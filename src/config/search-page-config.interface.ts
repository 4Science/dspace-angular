import { ViewMode } from '../app/core/shared/view-mode.model';
import { AdvancedSearchConfig } from './advance-search-config.interface';
import { Config } from './config.interface';

export interface SearchConfig extends Config {

    /**
     * List of standard filter to select in adding advanced Search
     * Used by {@link UploadBitstreamComponent}.
     */
    advancedFilters: AdvancedSearchConfig;
    /**
     * Number used to render n UI elements called loading skeletons that act as placeholders.
     * These elements indicate that some content will be loaded in their stead.
     * Since we don't know how many filters will be loaded before we receive a response from the server we use this parameter for the skeletons count.
     * For instance if we set 5 then 5 loading skeletons will be visualized before the actual filters are retrieved.
     */
    filterPlaceholdersCount?: number;
  /**
   * Application-wide default page size for the grid view ({@link ViewMode.GridElement}).
   * Used for any search context that does not define its own `preferredContextConfig.<context>.grid.pageSize`
   * (or whose grid configuration is rejected). Must be a multiple of 3.
   */
  gridViewDefaultPageSize?: number;
  /**
   * Application-wide default selectable page sizes for the grid view ({@link ViewMode.GridElement}).
   * Used for any search context that does not define its own `preferredContextConfig.<context>.grid.pageSizeOptions`
   * (or whose grid configuration is rejected). Every entry must be a multiple of 3.
   */
  gridViewPageSizeOptions?: number[];
  /**
   * The preferred configuration used to initially render the results for each search context.
   * When a value is set, the related search context will initially show its results using the
   * configured {@link ContextDisplayConfig} (unless the user explicitly overrides it through the
   * query parameters, e.g. `view` or `rpp`).
   */
  preferredContextConfig?: PreferredContextConfig;

}

/**
 * Configuration that defines the preferred display configuration for the different search contexts.
 */
export interface PreferredContextConfig extends Config {
  /**
   * The preferred configuration used by the main search page.
   */
  searchPage?: ContextDisplayConfig;

  /**
   * The preferred configuration used by the MyDSpace page.
   */
  mydspacePage?: ContextDisplayConfig;

  /**
   * The preferred configuration used by the CRIS layout relation boxes.
   */
  crisRelationBox?: ContextDisplayConfig;
}

/**
 * The preferred display configuration for a single search context.
 */
export interface ContextDisplayConfig extends Config {
  /**
   * The preferred display view ({@link ViewMode}) used to initially render the results.
   */
  preferredView?: ViewMode;

  /**
   * The preferred pagination used when the results are rendered using the list view
   * ({@link ViewMode.ListElement}).
   */
  listPaginationConfig?: ViewPaginationConfig;

  /**
   * The preferred pagination used when the results are rendered using the grid view
   * ({@link ViewMode.GridElement}).
   *
   * The grid view renders rows of up to 3 elements, so both {@link ViewPaginationConfig.pageSize}
   * and every entry of {@link ViewPaginationConfig.pageSizeOptions} must be a multiple of 3. Values
   * that are not a multiple of 3 are rejected (and a warning is logged), falling back to the global
   * {@link SearchConfig.gridViewDefaultPageSize} / {@link SearchConfig.gridViewPageSizeOptions}.
   * Fields left unset here are also taken from those global values.
   */
  gridPaginationConfig?: ViewPaginationConfig;
}

/**
 * The preferred pagination for a single search result view mode.
 */
export interface ViewPaginationConfig extends Config {
  /**
   * The preferred number of results per page used to initially render the results.
   * When it is not one of the selectable page sizes it is snapped to the nearest available option
   * by the pagination component at runtime.
   */
  pageSize?: number;

  /**
   * The list of selectable page sizes offered to the user for this view mode.
   * When set, it overrides the application-wide default page size options for this view mode.
   */
  pageSizeOptions?: number[];
}
