import { ViewMode } from '../app/core/shared/view-mode.model';
import { ContextDisplayConfig } from './search-page-config.interface';
import {
  getGridViewFallback,
  getPreferredPagination,
  getPreferredViewMode,
} from './search-page-config.util';

describe('search-page-config util', () => {

  describe('getPreferredViewMode', () => {
    it('should return the configured view mode when set', () => {
      const config: ContextDisplayConfig = { preferredView: ViewMode.GridElement };
      expect(getPreferredViewMode(config)).toBe(ViewMode.GridElement);
    });

    it('should return the default fallback when no view mode is configured', () => {
      expect(getPreferredViewMode(undefined)).toBe(ViewMode.ListElement);
      expect(getPreferredViewMode({})).toBe(ViewMode.ListElement);
    });

    it('should return the provided fallback when no view mode is configured', () => {
      expect(getPreferredViewMode(undefined, ViewMode.GridElement)).toBe(ViewMode.GridElement);
    });
  });

  describe('getPreferredPagination', () => {

    it('should return undefined for the detailed view (pagination not supported)', () => {
      const config: ContextDisplayConfig = {
        preferredView: ViewMode.DetailedListElement,
        listPaginationConfig: { pageSize: 40, pageSizeOptions: [20, 40, 60] },
      };
      expect(getPreferredPagination(config, ViewMode.DetailedListElement)).toBeUndefined();
    });

    it('should resolve the list pagination for the list view', () => {
      const config: ContextDisplayConfig = {
        listPaginationConfig: { pageSize: 20, pageSizeOptions: [10, 20, 40] },
      };
      expect(getPreferredPagination(config, ViewMode.ListElement)).toEqual({
        pageSize: 20,
        pageSizeOptions: [10, 20, 40],
      });
    });

    it('should resolve the grid pagination for the grid view', () => {
      const config: ContextDisplayConfig = {
        gridPaginationConfig: { pageSize: 12, pageSizeOptions: [12, 24, 48] },
      };
      expect(getPreferredPagination(config, ViewMode.GridElement)).toEqual({
        pageSize: 12,
        pageSizeOptions: [12, 24, 48],
      });
    });

    it('should return undefined when the view has no configured pagination', () => {
      const config: ContextDisplayConfig = { listPaginationConfig: { pageSize: 20 } };
      expect(getPreferredPagination(config, ViewMode.GridElement)).toBeUndefined();
      expect(getPreferredPagination(undefined, ViewMode.ListElement)).toBeUndefined();
    });

    describe('page size pass-through (runtime snaps to nearest option)', () => {
      it('should pass the configured page size through unchanged, even when not in the options', () => {
        // Snapping is performed at runtime by PaginationService.getBestMatchPageSize, not here.
        const config: ContextDisplayConfig = {
          listPaginationConfig: { pageSize: 33, pageSizeOptions: [10, 20, 40] },
        };
        expect(getPreferredPagination(config, ViewMode.ListElement)).toEqual({
          pageSize: 33,
          pageSizeOptions: [10, 20, 40],
        });
      });

      it('should pass the page size through when the view configures no options', () => {
        const config: ContextDisplayConfig = { listPaginationConfig: { pageSize: 33 } };
        expect(getPreferredPagination(config, ViewMode.ListElement)).toEqual({
          pageSize: 33,
          pageSizeOptions: undefined,
        });
      });
    });

    describe('grid multiple-of-3 validation', () => {
      let warnSpy: jasmine.Spy;

      beforeEach(() => {
        warnSpy = spyOn(console, 'warn');
      });

      it('should reject the grid pagination when the page size is not a multiple of 3', () => {
        const config: ContextDisplayConfig = {
          gridPaginationConfig: { pageSize: 10, pageSizeOptions: [9, 18, 36] },
        };
        expect(getPreferredPagination(config, ViewMode.GridElement)).toBeUndefined();
        expect(warnSpy).toHaveBeenCalled();
      });

      it('should reject the grid pagination when any page size option is not a multiple of 3', () => {
        const config: ContextDisplayConfig = {
          gridPaginationConfig: { pageSize: 9, pageSizeOptions: [9, 20, 36] },
        };
        expect(getPreferredPagination(config, ViewMode.GridElement)).toBeUndefined();
        expect(warnSpy).toHaveBeenCalled();
      });

      it('should accept the grid pagination when every value is a multiple of 3', () => {
        const config: ContextDisplayConfig = {
          gridPaginationConfig: { pageSize: 9, pageSizeOptions: [9, 18, 36] },
        };
        expect(getPreferredPagination(config, ViewMode.GridElement)).toEqual({
          pageSize: 9,
          pageSizeOptions: [9, 18, 36],
        });
        expect(warnSpy).not.toHaveBeenCalled();
      });

      it('should not apply the multiple-of-3 rule to the list view', () => {
        const config: ContextDisplayConfig = {
          listPaginationConfig: { pageSize: 10, pageSizeOptions: [10, 20, 40] },
        };
        expect(getPreferredPagination(config, ViewMode.ListElement)).toEqual({
          pageSize: 10,
          pageSizeOptions: [10, 20, 40],
        });
        expect(warnSpy).not.toHaveBeenCalled();
      });
    });

    describe('global grid fallback', () => {
      const gridFallback = { pageSize: 18, pageSizeOptions: [9, 18, 36] };
      let warnSpy: jasmine.Spy;

      beforeEach(() => {
        warnSpy = spyOn(console, 'warn');
      });

      it('should use the global grid pagination when the context defines no grid block', () => {
        const config: ContextDisplayConfig = { listPaginationConfig: { pageSize: 10 } };
        expect(getPreferredPagination(config, ViewMode.GridElement, gridFallback)).toEqual({
          pageSize: 18,
          pageSizeOptions: [9, 18, 36],
        });
      });

      it('should use the global grid pagination when there is no context config at all', () => {
        expect(getPreferredPagination(undefined, ViewMode.GridElement, gridFallback)).toEqual({
          pageSize: 18,
          pageSizeOptions: [9, 18, 36],
        });
      });

      it('should prefer the context grid block over the global grid pagination', () => {
        const config: ContextDisplayConfig = { gridPaginationConfig: { pageSize: 12, pageSizeOptions: [12, 24, 48] } };
        expect(getPreferredPagination(config, ViewMode.GridElement, gridFallback)).toEqual({
          pageSize: 12,
          pageSizeOptions: [12, 24, 48],
        });
      });

      it('should take the missing fields of a partial context grid block from the global grid pagination', () => {
        const config: ContextDisplayConfig = { gridPaginationConfig: { pageSizeOptions: [12, 24, 48] } };
        expect(getPreferredPagination(config, ViewMode.GridElement, gridFallback)).toEqual({
          pageSize: 18,
          pageSizeOptions: [12, 24, 48],
        });
      });

      it('should fall back to the global grid pagination when the context grid block is invalid', () => {
        const config: ContextDisplayConfig = { gridPaginationConfig: { pageSize: 10, pageSizeOptions: [10, 20] } };
        expect(getPreferredPagination(config, ViewMode.GridElement, gridFallback)).toEqual({
          pageSize: 18,
          pageSizeOptions: [9, 18, 36],
        });
        expect(warnSpy).toHaveBeenCalledTimes(1);
      });

      it('should ignore an invalid global grid pagination and return undefined when nothing else applies', () => {
        expect(getPreferredPagination(undefined, ViewMode.GridElement, { pageSize: 10, pageSizeOptions: [10, 20] })).toBeUndefined();
        expect(warnSpy).toHaveBeenCalledTimes(1);
      });

      it('should not use the global grid pagination for the list or detailed views', () => {
        expect(getPreferredPagination({}, ViewMode.ListElement, gridFallback)).toBeUndefined();
        expect(getPreferredPagination({}, ViewMode.DetailedListElement, gridFallback)).toBeUndefined();
      });
    });

    describe('getGridViewFallback', () => {
      it('should map the global grid search settings', () => {
        expect(getGridViewFallback({
          advancedFilters: { enabled: false, filter: [] },
          gridViewDefaultPageSize: 9,
          gridViewPageSizeOptions: [9, 18],
        })).toEqual({ pageSize: 9, pageSizeOptions: [9, 18] });
      });

      it('should return undefined when no global grid settings are defined', () => {
        expect(getGridViewFallback(undefined)).toBeUndefined();
        expect(getGridViewFallback({ advancedFilters: { enabled: false, filter: [] } })).toBeUndefined();
      });
    });
  });
});
